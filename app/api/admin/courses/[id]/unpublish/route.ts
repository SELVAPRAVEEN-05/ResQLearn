import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("errorResponse" in auth) {
    return auth.errorResponse;
  }

  const { id } = await params;

  try {
    const isNumeric = /^\d+$/.test(id);
    const result = await query(
      `UPDATE resq_courses
       SET is_published = FALSE,
           updated_at = CURRENT_TIMESTAMP
       WHERE ${isNumeric ? "id = $1 OR slug = $2" : "slug = $1"}
       RETURNING id, slug, title, is_published as "published"`,
      isNumeric ? [parseInt(id, 10), id] : [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Course unpublished successfully",
      course: result.rows[0],
    });
  } catch (error: any) {
    console.error("Unpublish course error:", error);
    return NextResponse.json({ error: "Failed to unpublish course" }, { status: 500 });
  }
}
