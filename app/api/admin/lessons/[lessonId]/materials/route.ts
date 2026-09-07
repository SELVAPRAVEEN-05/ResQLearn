import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { MaterialCreateSchema, detectMaterialTypeFromUrl } from "@/lib/validations/course";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const auth = await requireAdmin();
  if ("errorResponse" in auth) {
    return auth.errorResponse;
  }

  const { lessonId } = await params;

  try {
    const isNumeric = /^\d+$/.test(lessonId);
    const lessonRes = await query(
      `SELECT id FROM resq_lessons WHERE ${isNumeric ? "id = $1 OR lesson_id = $2" : "lesson_id = $1"}`,
      isNumeric ? [parseInt(lessonId, 10), lessonId] : [lessonId]
    );

    if (lessonRes.rows.length === 0) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const actualLessonId = lessonRes.rows[0].id;
    const body = await request.json();

    // Auto-detect type if not explicitly provided
    if (!body.type && body.url) {
      body.type = detectMaterialTypeFromUrl(body.url);
    }

    const parsed = MaterialCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { title, description, type, url } = parsed.data;

    let order = parsed.data.order;
    if (order === undefined || order === null) {
      const maxOrderRes = await query(
        `SELECT COALESCE(MAX(order_index), -1) + 1 as next_order FROM resq_materials WHERE lesson_id = $1`,
        [actualLessonId]
      );
      order = maxOrderRes.rows[0]?.next_order ?? 0;
    }

    const matRes = await query(
      `INSERT INTO resq_materials (lesson_id, title, description, type, url, order_index, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, lesson_id as "lessonId", title, description, type, url, order_index as "order", created_at as "createdAt"`,
      [actualLessonId, title, description || "", type, url, order]
    );

    return NextResponse.json(
      { message: "Material added successfully", material: matRes.rows[0] },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Add material error:", error);
    return NextResponse.json({ error: "Failed to add material" }, { status: 500 });
  }
}
