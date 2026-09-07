import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const isNumeric = /^\d+$/.test(slug);
    const courseRes = await query(
      `SELECT id FROM resq_courses WHERE ${isNumeric ? "(id = $1 OR slug = $2)" : "slug = $1"} AND is_published = TRUE`,
      isNumeric ? [parseInt(slug, 10), slug] : [slug]
    );

    if (courseRes.rows.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const courseId = courseRes.rows[0].id;

    const lessonsRes = await query(
      `SELECT id, lesson_id as "lessonId", title, description, type, content, order_index as "order"
       FROM resq_lessons
       WHERE course_id = $1 AND is_published = TRUE
       ORDER BY order_index ASC, id ASC`,
      [courseId]
    );

    const lessons = [];
    for (const l of lessonsRes.rows) {
      const matsRes = await query(
        `SELECT id, lesson_id as "lessonId", title, description, type, url, order_index as "order"
         FROM resq_materials
         WHERE lesson_id = $1
         ORDER BY order_index ASC, id ASC`,
        [l.id]
      );
      lessons.push({
        ...l,
        materials: matsRes.rows,
      });
    }

    return NextResponse.json({ lessons });
  } catch (error: any) {
    console.error("Fetch lessons error:", error);
    return NextResponse.json({ error: "Failed to fetch lessons" }, { status: 500 });
  }
}
