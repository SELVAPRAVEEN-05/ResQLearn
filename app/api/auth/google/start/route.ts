import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";

import {
  assertGoogleOAuthConfigured,
  getGoogleRedirectUri,
  googleOAuthClient,
  isAllowedReturnPath,
} from "@/lib/google-auth";

export async function GET(request: Request) {
  try {
    assertGoogleOAuthConfigured();

    const returnTo = new URL(request.url).searchParams.get("returnTo");
    const safeReturnTo = isAllowedReturnPath(returnTo) ? returnTo : "/login";
    const state = randomBytes(32).toString("hex");
    const cookieStore = await cookies();

    cookieStore.set("google_oauth_state", `${state}:${safeReturnTo}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60,
      path: "/",
    });

    const authorizationUrl = googleOAuthClient.generateAuthUrl({
      access_type: "online",
      scope: ["openid", "email", "profile"],
      state,
      prompt: "select_account",
      redirect_uri: getGoogleRedirectUri(),
    });

    return NextResponse.redirect(authorizationUrl);
  } catch (error) {
    console.error("Google OAuth start failed:", error);
    return NextResponse.redirect(new URL("/login?google=unavailable", request.url));
  }
}
