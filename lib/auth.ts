import { cookies } from "next/headers";
import { verifyToken, UserTokenPayload } from "./jwt";
import { query } from "./db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function getSessionUser(): Promise<UserTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function requireAdmin(): Promise<{ user: UserTokenPayload } | { errorResponse: NextResponse }> {
  const session = await getSessionUser();
  if (!session) {
    return {
      errorResponse: NextResponse.json(
        { error: "Unauthorized. Please log in to access this resource." },
        { status: 401 }
      ),
    };
  }

  if (session.role !== "admin") {
    return {
      errorResponse: NextResponse.json(
        { error: "Forbidden. Admin privileges required." },
        { status: 403 }
      ),
    };
  }

  return { user: session };
}

export async function requireUser(): Promise<{ user: UserTokenPayload } | { errorResponse: NextResponse }> {
  const session = await getSessionUser();
  if (!session) {
    return {
      errorResponse: NextResponse.json(
        { error: "Unauthorized. Please log in to access this resource." },
        { status: 401 }
      ),
    };
  }
  return { user: session };
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function getUserById(id: number) {
  const result = await query(
    `SELECT id, name, email, role, institution, department, year_of_study, preparedness_score, certificates, avatar, status 
     FROM resq_users WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}
