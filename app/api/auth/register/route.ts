import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { query } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { signToken } from "@/lib/jwt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fullName,
      email,
      password,
      institution,
      department,
      yearOfStudy,
      agreeToTerms,
    } = body;

    const normalizedEmail = String(email ?? "").trim().toLowerCase();

    if (
      !String(fullName ?? "").trim() ||
      !normalizedEmail ||
      !String(password ?? "").trim() ||
      !String(institution ?? "").trim() ||
      !String(department ?? "").trim()
    ) {
      return NextResponse.json(
        { error: "Name, email, institution, department, and password are required." },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 },
      );
    }

    if (String(password).length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }

    if (agreeToTerms !== true) {
      return NextResponse.json(
        { error: "You must agree to the Terms & Conditions and Privacy Policy." },
        { status: 400 },
      );
    }

    // Check if user exists
    const existing = await query(
      "SELECT id FROM resq_users WHERE LOWER(TRIM(email)) = $1 LIMIT 1",
      [normalizedEmail],
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);

    const result = await query(
      `INSERT INTO resq_users (name, email, password_hash, role, institution, department, year_of_study)
       VALUES ($1, $2, $3, 'student', $4, $5, $6)
       RETURNING id, name, email, role, institution, department, year_of_study, preparedness_score, certificates, status`,
      [
        fullName.trim(),
        normalizedEmail,
        passwordHash,
        institution || "",
        department || "",
        yearOfStudy || "",
      ],
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

    return NextResponse.json(
      {
        message: "User registered successfully",
        user,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Registration error:", error);

    if (
      error?.code === "23505" &&
      (error?.constraint === "resq_users_email_key" ||
        error?.constraint === "idx_resq_users_email")
    ) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    if (
      error?.code === "ECONNREFUSED" ||
      error?.code === "ENOTFOUND" ||
      error?.code === "ETIMEDOUT" ||
      error?.code === "28P01" ||
      error?.code === "28000" ||
      error?.code === "3D000" ||
      error?.message?.toLowerCase().includes("connection")
    ) {
      return NextResponse.json(
        { error: "Registration is temporarily unavailable because Neon DB cannot be reached." },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error during registration." },
      { status: 500 },
    );
  }
}
