import { NextResponse } from "next/server";
import { getSessionUser, getUserById } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserById(session.id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ profile: user });
}

export async function PUT(request: Request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, institution, department, yearOfStudy, avatar } = body;

    const result = await query(
      `UPDATE resq_users 
       SET name = COALESCE($1, name),
           institution = COALESCE($2, institution),
           department = COALESCE($3, department),
           year_of_study = COALESCE($4, year_of_study),
           avatar = COALESCE($5, avatar),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING id, name, email, role, institution, department, year_of_study, preparedness_score, certificates, avatar, status`,
      [name, institution, department, yearOfStudy, avatar, session.id]
    );

    return NextResponse.json({
      message: "Profile updated successfully",
      profile: result.rows[0],
    });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
