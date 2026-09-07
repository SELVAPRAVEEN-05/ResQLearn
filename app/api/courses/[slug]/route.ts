import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await getSessionUser();
  const userId = session ? session.id : 0;

  try {
    const isNumeric = /^\d+$/.test(slug);
    const courseRes = await query(
      `SELECT c.id, c.slug, c.title, c.description, c.category as "disasterType", c.category,
              c.icon_name as "iconName", c.duration as "estimatedDuration", c.duration,
              c.thumbnail, c.difficulty, c.is_published as "published", c.is_published,
              COALESCE(p.progress_percent, 0) as progress
       FROM resq_courses c
       LEFT JOIN resq_user_course_progress p ON c.id = p.course_id AND p.user_id = $1
       WHERE ${isNumeric ? "(c.id = $2 OR c.slug = $3)" : "c.slug = $2"} AND c.is_published = TRUE`,
      isNumeric ? [userId, parseInt(slug, 10), slug] : [userId, slug]
    );

    if (courseRes.rows.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const course = courseRes.rows[0];

    const lessonsRes = await query(
      `SELECT l.id, l.lesson_id as "lessonId", l.title, l.description, l.type, l.content, l.order_index as "order"
       FROM resq_lessons l
       WHERE l.course_id = $1 AND l.is_published = TRUE
       ORDER BY l.order_index ASC, l.id ASC`,
      [course.id]
    );

    const progRes = await query(
      `SELECT completed_lesson_ids FROM resq_user_course_progress WHERE user_id = $1 AND course_id = $2`,
      [userId, course.id]
    );
    const completedIds: string[] = progRes.rows[0]?.completed_lesson_ids || [];

    let foundNext = false;
    const formattedLessons = [];

    for (let index = 0; index < lessonsRes.rows.length; index++) {
      const l = lessonsRes.rows[index];
      const matsRes = await query(
        `SELECT id, lesson_id as "lessonId", title, description, type, url, order_index as "order"
         FROM resq_materials
         WHERE lesson_id = $1
         ORDER BY order_index ASC, id ASC`,
        [l.id]
      );

      const isCompleted = completedIds.includes(String(l.id)) || completedIds.includes(l.lessonId);
      let status: "completed" | "in-progress" | "locked" = "locked";

      if (isCompleted) {
        status = "completed";
      } else if (!foundNext) {
        status = "in-progress";
        foundNext = true;
      }

      if (index === 0 && completedIds.length === 0) {
        status = "in-progress";
        foundNext = true;
      }

      formattedLessons.push({
        ...l,
        status,
        materials: matsRes.rows,
      });
    }

    return NextResponse.json({
      course: {
        ...course,
        progress: Number(course.progress),
        lessons: formattedLessons,
      },
    });
  } catch (error: any) {
    console.error("Course fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch course details" }, { status: 500 });
  }
}
