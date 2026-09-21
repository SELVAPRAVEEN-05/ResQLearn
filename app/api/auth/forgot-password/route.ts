import { NextResponse } from "next/server";

import { query } from "@/lib/db";
import {
  createPasswordResetToken,
  sendPasswordResetEmail,
} from "@/lib/passwordReset";

const GENERIC_RESPONSE = {
  message: "If an account exists for that email, reset instructions have been sent.",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const userResult = await query(
      "SELECT id, email FROM resq_users WHERE LOWER(email) = $1 LIMIT 1",
      [email],
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(GENERIC_RESPONSE);
    }

    const { token, tokenHash, expiresAt } = createPasswordResetToken();
    await query(
      "UPDATE resq_users SET password_reset_token_hash = $1, password_reset_expires_at = $2 WHERE id = $3",
      [tokenHash, expiresAt, userResult.rows[0].id],
    );

    const appUrl = process.env.APP_URL || new URL(request.url).origin;
    const resetUrl = `${appUrl}/reset-password/${token}`;
    const emailSent = await sendPasswordResetEmail(email, resetUrl);

    if (!emailSent) {
      await query(
        "UPDATE resq_users SET password_reset_token_hash = NULL, password_reset_expires_at = NULL WHERE id = $1",
        [userResult.rows[0].id],
      );

      if (process.env.NODE_ENV !== "production") {
        return NextResponse.json({ ...GENERIC_RESPONSE, developmentResetUrl: resetUrl });
      }

      return NextResponse.json(
        { error: "Password reset email is not configured. Please contact an administrator." },
        { status: 503 },
      );
    }

    return NextResponse.json(GENERIC_RESPONSE);
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Unable to start password reset." }, { status: 500 });
  }
}