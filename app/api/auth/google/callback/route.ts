import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";

import { query } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { signToken } from "@/lib/jwt";
import {
  assertGoogleOAuthConfigured,
  getGoogleRedirectUri,
  googleOAuthClient,
} from "@/lib/google-auth";

function errorRedirect(request: Request, returnTo: string, reason: string) {
  const url = new URL(returnTo, request.url);
  url.searchParams.set("google", reason);
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const cookieStore = await cookies();
  const stateCookie = cookieStore.get("google_oauth_state")?.value;
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const [expectedState, returnTo = "/login"] = stateCookie?.split(":") || [];

  cookieStore.delete("google_oauth_state");

  if (!stateCookie || !state || state !== expectedState || !code) {
    return errorRedirect(request, returnTo, "invalid");
  }

  try {
    assertGoogleOAuthConfigured();

    const { tokens } = await googleOAuthClient.getToken({
      code,
      redirect_uri: getGoogleRedirectUri(),
    });

    if (!tokens.id_token) {
      return errorRedirect(request, returnTo, "verification_failed");
    }

    const ticket = await googleOAuthClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email || payload.email_verified !== true) {
      return errorRedirect(request, returnTo, "verification_failed");
    }

    const email = payload.email.trim().toLowerCase();
    let userResult = await query(
      `SELECT * FROM resq_users
       WHERE google_id = $1 OR LOWER(TRIM(email)) = $2
       LIMIT 1`,
      [payload.sub, email],
    );

    if (userResult.rows.length === 0) {
      const passwordHash = await hashPassword(randomBytes(32).toString("hex"));
      userResult = await query(
        `INSERT INTO resq_users
          (name, email, password_hash, role, institution, department, status, avatar, google_id, auth_provider)
         VALUES ($1, $2, $3, 'student', $4, $5, 'Active', $6, $7, 'google')
         RETURNING *`,
        [
          payload.name?.trim() || email.split("@")[0],
          email,
          passwordHash,
          "Google account",
          "Google OAuth",
          payload.picture || null,
          payload.sub,
        ],
      );
    } else {
      const existingUser = userResult.rows[0];
      if (existingUser.status === "Inactive") {
        return errorRedirect(request, returnTo, "inactive");
      }

      if (existingUser.google_id !== payload.sub) {
        userResult = await query(
          `UPDATE resq_users
           SET google_id = $1,
               auth_provider = CASE
                 WHEN auth_provider = 'password' THEN 'password+google'
                 ELSE auth_provider
               END,
               avatar = COALESCE($2, avatar),
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $3
           RETURNING *`,
          [payload.sub, payload.picture || null, existingUser.id],
        );
      }
    }

    const user = userResult.rows[0];
    const token = await signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });
    cookieStore.set("role", user.role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    const destination = user.role === "admin" || user.role === "faculty"
      ? "/admin"
      : "/user/dashboard";

    return NextResponse.redirect(new URL(destination, request.url));
  } catch (error) {
    console.error("Google OAuth callback failed:", error);
    return errorRedirect(request, returnTo, "failed");
  }
}
