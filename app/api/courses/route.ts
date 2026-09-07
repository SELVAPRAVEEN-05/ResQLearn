import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  const session = await getSessionUser();
  const userId = session ? session.id : 0;

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  try {
    let queryText = `
      SELECT c.id, c.slug, c.title, c.description, c.category as "disasterType", c.category,
             c.icon_name as "iconName", c.duration as "estimatedDuration", c.duration,
             c.thumbnail, c.difficulty, c.is_published as "published", c.is_published,
             COALESCE(p.progress_percent, 0) as progress
      FROM resq_courses c
      LEFT JOIN resq_user_course_progress p ON c.id = p.course_id AND p.user_id = $1
      WHERE c.is_published = TRUE
    `;
    const params: any[] = [userId];

    if (category && category !== "All") {
      params.push(category);
      queryText += ` AND LOWER(c.category) = LOWER($${params.length})`;
    }

    queryText += ` ORDER BY c.id ASC`;

    const coursesRes = await query(queryText, params);

    const courses = [];
    for (const c of coursesRes.rows) {
      // Get lessons for this course
      const lessonsRes = await query(
        `SELECT l.id, l.lesson_id as "lessonId", l.title, l.description, l.type, l.content, l.order_index as "order"
         FROM resq_lessons l
         WHERE l.course_id = $1 AND l.is_published = TRUE
         ORDER BY l.order_index ASC, l.id ASC`,
        [c.id]
      );

      // Get materials for each lesson
      const lessonsWithMaterials = [];
      for (const l of lessonsRes.rows) {
        const matsRes = await query(
          `SELECT id, lesson_id as "lessonId", title, description, type, url, order_index as "order"
           FROM resq_materials
           WHERE lesson_id = $1
           ORDER BY order_index ASC, id ASC`,
          [l.id]
        );
        lessonsWithMaterials.push({
          ...l,
          materials: matsRes.rows,
        });
      }

      // Get completed lessons list for user progress tracking
      const progRes = await query(
        `SELECT completed_lesson_ids FROM resq_user_course_progress WHERE user_id = $1 AND course_id = $2`,
        [userId, c.id]
      );
      const completedIds: string[] = progRes.rows[0]?.completed_lesson_ids || [];

      let foundNext = false;
      const formattedLessons = lessonsWithMaterials.map((l, index) => {
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

        return {
          ...l,
          status,
        };
      });

      courses.push({
        ...c,
        progress: Number(c.progress),
        lessons: formattedLessons,
        lessonCount: formattedLessons.length,
      });
    }

    return NextResponse.json({ courses });
  } catch (error: any) {
    console.error("Fetch courses error:", error);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}
