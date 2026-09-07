import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ progress: 0, completed: false, status: "locked" });
  }
  const userId = session.id;

  try {
    const isNumeric = /^\d+$/.test(slug);
    const courseRes = await query(
      `SELECT id FROM resq_courses WHERE ${isNumeric ? "id = $1 OR slug = $2" : "slug = $1"}`,
      isNumeric ? [parseInt(slug, 10), slug] : [slug]
    );

    if (courseRes.rows.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const courseId = courseRes.rows[0].id;

    const progRes = await query(
      `SELECT progress_percent as progress, completed, status, completed_lesson_ids as "completedLessonIds",
              last_accessed_lesson_id as "lastAccessedLessonId", updated_at as "updatedAt"
       FROM resq_user_course_progress
       WHERE user_id = $1 AND course_id = $2`,
      [userId, courseId]
    );

    if (progRes.rows.length === 0) {
      return NextResponse.json({
        progress: 0,
        completed: false,
        status: "in-progress",
        completedLessonIds: [],
      });
    }

    return NextResponse.json(progRes.rows[0]);
  } catch (error: any) {
    console.error("Fetch course progress error:", error);
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
  }
}
