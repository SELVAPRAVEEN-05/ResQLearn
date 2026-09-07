import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { comparePassword } from "@/lib/auth";
import { signToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email/username and password are required." },
        { status: 400 }
      );
    }

    const inputUser = email.toLowerCase().trim();

    // Support admin alias or normal email
    let userResult;
    if (inputUser === "admin") {
      userResult = await query(
        "SELECT * FROM resq_users WHERE email = 'admin@safegraph.ai' OR role = 'admin' LIMIT 1"
      );
    } else {
      userResult = await query(
        "SELECT * FROM resq_users WHERE email = $1",
        [inputUser]
      );
    }

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid email/username or password." },
        { status: 401 }
      );
    }

    const user = userResult.rows[0];

    if (user.status === "Inactive") {
      return NextResponse.json(
        { error: "Account has been deactivated. Please contact administration." },
        { status: 403 }
      );
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email/username or password." },
        { status: 401 }
      );
    }

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

    const { password_hash, ...safeUser } = user;

    return NextResponse.json({
      message: "Login successful",
      user: safeUser,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error during login." },
      { status: 500 }
    );
  }
}
