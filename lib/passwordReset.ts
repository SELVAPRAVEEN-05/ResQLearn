import { createHash, randomBytes } from "crypto";

export const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

export function createPasswordResetToken() {
  const token = randomBytes(32).toString("hex");

  return {
    token,
    tokenHash: createHash("sha256").update(token).digest("hex"),
    expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
  };
}

export function hashPasswordResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESET_EMAIL_FROM;

  if (!apiKey || !from) return false;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: "Reset your SafeGraph AI password",
        text: `Use this link to reset your SafeGraph AI password. It expires in one hour:\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
      }),
    });

    return response.ok;
  } catch {
    return false;
  }
}