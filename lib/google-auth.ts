import { OAuth2Client } from "google-auth-library";

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

export const googleOAuthClient = new OAuth2Client(
  clientId,
  clientSecret,
  getGoogleRedirectUri(),
);

export function getGoogleRedirectUri(): string {
  const redirectUri = process.env.GOOGLE_REDIRECT_URI?.trim();

  if (!redirectUri) {
    throw new Error("GOOGLE_REDIRECT_URI is not configured on the server.");
  }

  return redirectUri.replace(/\/$/, "");
}

export function assertGoogleOAuthConfigured(): void {
  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth is not configured on the server.");
  }
}

export function isAllowedReturnPath(value: string | null): boolean {
  return value === "/login" || value === "/register";
}
