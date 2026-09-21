import { NextResponse } from "next/server";

import { hashPassword } from "@/lib/auth";
import { query } from "@/lib/db";
import { hashPasswordResetToken } from "@/lib/passwordReset";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = String(body.token ?? "").trim();
    const password = String(body.password ?? "");

    if (!token || password.length < 8) {
      return NextResponse.json({ error: "A valid token and password of at least 8 characters are required." }, { status: 400 });
    }

    const result = await query(
      `SELECT id FROM resq_users
       WHERE password_reset_token_hash = $1
         AND password_reset_expires_at > CURRENT_TIMESTAMP
       LIMIT 1`,
      [hashPasswordResetToken(token)],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    await query(
      `UPDATE resq_users
       SET password_hash = $1, password_reset_token_hash = NULL, password_reset_expires_at = NULL
       WHERE id = $2`,
      [passwordHash, result.rows[0].id],
    );

    return NextResponse.json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Unable to reset password." }, { status: 500 });
  }
}