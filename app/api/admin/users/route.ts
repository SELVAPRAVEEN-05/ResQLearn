import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";

  try {
    let result;
    if (search) {
      result = await query(
        `SELECT id, name, email, role, institution, department, year_of_study, status, preparedness_score, certificates, created_at
         FROM resq_users
         WHERE LOWER(name) LIKE $1 OR LOWER(email) LIKE $1
         ORDER BY created_at DESC`,
        [`%${search.toLowerCase()}%`]
      );
    } else {
      result = await query(
        `SELECT id, name, email, role, institution, department, year_of_study, status, preparedness_score, certificates, created_at
         FROM resq_users
         ORDER BY id ASC`
      );
    }

    return NextResponse.json({
      users: result.rows.map((u) => ({
        id: u.id.toString(),
        name: u.name,
        email: u.email,
        role: u.role === 'admin' ? 'Admin' : 'Student',
        status: u.status,
        institution: u.institution,
        department: u.department,
        preparednessScore: u.preparedness_score,
        certificates: u.certificates,
      })),
    });
  } catch (error: any) {
    console.error("Fetch users error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
