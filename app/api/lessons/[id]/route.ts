import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSessionUser();
  const userId = session ? session.id : null;

  try {
    const isNumeric = /^\d+$/.test(id);
    const lessonRes = await query(
      `SELECT l.id, l.lesson_id as "lessonId", l.course_id as "courseId", l.title, l.description, l.content, l.type,
              l.order_index as "order", c.slug as "courseSlug", c.title as "courseTitle"
       FROM resq_lessons l
       JOIN resq_courses c ON l.course_id = c.id
       WHERE ${isNumeric ? "(l.id = $1 OR l.lesson_id = $2)" : "l.lesson_id = $1"}`,
      isNumeric ? [parseInt(id, 10), id] : [id]
    );

    if (lessonRes.rows.length === 0) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const lesson = lessonRes.rows[0];

    // Check if lesson is completed by user
    let isLessonCompleted = false;
    if (userId) {
      const lpRes = await query(
        "SELECT completed FROM resq_user_lesson_progress WHERE user_id = $1 AND lesson_id = $2",
        [userId, lesson.id]
      );
      isLessonCompleted = lpRes.rows[0]?.completed === true;
    }

    const matsRes = await query(
      `SELECT m.id, m.lesson_id as "lessonId", m.title, m.description, m.type, m.url, m.order_index as "order",
              COALESCE(mp.completed, FALSE) as completed,
              COALESCE(mp.progress_percent, 0) as "progressPercent"
       FROM resq_materials m
       LEFT JOIN resq_user_material_progress mp ON m.id = mp.material_id AND mp.user_id = $2
       WHERE m.lesson_id = $1
       ORDER BY m.order_index ASC, m.id ASC`,
      [lesson.id, userId || 0]
    );

    return NextResponse.json({
      lesson: {
        ...lesson,
        completed: isLessonCompleted,
        materials: matsRes.rows,
      },
    });
  } catch (error: any) {
    console.error("Fetch lesson error:", error);
    return NextResponse.json({ error: "Failed to fetch lesson" }, { status: 500 });
  }
}
