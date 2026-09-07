import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "resqlearn_super_secret_jwt_key_2026_safe_guard";
const key = new TextEncoder().encode(JWT_SECRET);

export interface UserTokenPayload {
  id: number;
  email: string;
  name: string;
  role: "student" | "admin";
}

export async function signToken(payload: UserTokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function verifyToken(token: string): Promise<UserTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload as unknown as UserTokenPayload;
  } catch {
    return null;
  }
}
