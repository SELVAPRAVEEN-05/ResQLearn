import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { signToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, password, institution, department, yearOfStudy } = body;

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    // Check if user exists
    const existing = await query("SELECT id FROM resq_users WHERE email = $1", [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const result = await query(
      `INSERT INTO resq_users (name, email, password_hash, role, institution, department, year_of_study)
       VALUES ($1, $2, $3, 'student', $4, $5, $6)
       RETURNING id, name, email, role, institution, department, year_of_study, preparedness_score, certificates, status`,
      [fullName.trim(), email.toLowerCase().trim(), passwordHash, institution || "", department || "", yearOfStudy || ""]
    );

    const user = result.rows[0];

    const token = await signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });
    cookieStore.set("role", user.role, {
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return NextResponse.json({
      message: "User registered successfully",
      user,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error during registration." },
      { status: 500 }
    );
  }
}
