import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
  }
  const userId = session.id;

  try {
    const materialId = parseInt(id, 10);
    if (isNaN(materialId)) {
      return NextResponse.json({ error: "Invalid material ID" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const isCompleted = body.completed !== false; // default to true
    const progressPercent = typeof body.progressPercent === "number" ? Math.min(100, Math.max(0, body.progressPercent)) : (isCompleted ? 100 : 0);

    // 1. Get material and lesson info
    const matRes = await query(
      `SELECT m.id, m.lesson_id, l.course_id, l.id as actual_lesson_id, l.lesson_id as string_lesson_id
       FROM resq_materials m
       JOIN resq_lessons l ON m.lesson_id = l.id
       WHERE m.id = $1`,
      [materialId]
    );

    if (matRes.rows.length === 0) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 });
    }

    const { lesson_id: lessonDbId, course_id: courseId, string_lesson_id: stringLessonId } = matRes.rows[0];

    // 2. Upsert material progress
    await query(
      `INSERT INTO resq_user_material_progress (user_id, material_id, completed, progress_percent, completed_at, updated_at)
       VALUES ($1, $2, $3, $4, ${isCompleted ? "CURRENT_TIMESTAMP" : "NULL"}, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, material_id) DO UPDATE SET
         completed = EXCLUDED.completed,
         progress_percent = EXCLUDED.progress_percent,
         completed_at = CASE WHEN EXCLUDED.completed = TRUE THEN CURRENT_TIMESTAMP ELSE resq_user_material_progress.completed_at END,
         updated_at = CURRENT_TIMESTAMP`,
      [userId, materialId, isCompleted, progressPercent]
    );

    // 3. Check if all materials of this lesson are completed
    const allLessonMaterialsRes = await query(
      "SELECT id FROM resq_materials WHERE lesson_id = $1",
      [lessonDbId]
    );

    const totalLessonMaterials = allLessonMaterialsRes.rows.length;
    let lessonCompleted = false;

    if (totalLessonMaterials > 0) {
      const completedMatsRes = await query(
        `SELECT COUNT(*)::int as count 
         FROM resq_user_material_progress 
         WHERE user_id = $1 AND material_id = ANY($2) AND completed = TRUE`,
        [userId, allLessonMaterialsRes.rows.map(m => m.id)]
      );

      const completedMatsCount = completedMatsRes.rows[0]?.count || 0;
      lessonCompleted = completedMatsCount >= totalLessonMaterials;
    } else {
      lessonCompleted = true;
    }

    // 4. If all materials are complete, update lesson and course progress
    let courseProgressPercent = 0;
    let courseCompleted = false;

    if (lessonCompleted) {
      await query(
        `INSERT INTO resq_user_lesson_progress (user_id, lesson_id, completed, completed_at, updated_at)
         VALUES ($1, $2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id, lesson_id) DO UPDATE SET
           completed = TRUE,
           completed_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP`,
        [userId, lessonDbId]
      );

      // Recalculate Course Progress
      const allLessonsRes = await query(
        "SELECT id, lesson_id FROM resq_lessons WHERE course_id = $1 AND is_published = TRUE",
        [courseId]
      );
      const totalCourseLessons = allLessonsRes.rows.length;

      const completedLessonsRes = await query(
        `SELECT lesson_id FROM resq_user_lesson_progress WHERE user_id = $1 AND completed = TRUE AND lesson_id = ANY($2)`,
        [userId, allLessonsRes.rows.map(l => l.id)]
      );
      const completedLessonCount = completedLessonsRes.rows.length;

      courseProgressPercent = totalCourseLessons > 0 ? Math.min(100, Math.round((completedLessonCount / totalCourseLessons) * 100)) : 100;
      courseCompleted = courseProgressPercent === 100;
      const status = courseCompleted ? "completed" : "in-progress";

      const completedIds = allLessonsRes.rows
        .filter(l => completedLessonsRes.rows.some(cl => cl.lesson_id === l.id))
        .map(l => String(l.id));

      await query(
        `INSERT INTO resq_user_course_progress (user_id, course_id, progress_percent, status, completed, completed_lesson_ids, last_accessed_lesson_id, started_at, completed_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, ${courseCompleted ? "CURRENT_TIMESTAMP" : "NULL"}, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id, course_id) DO UPDATE SET
           progress_percent = EXCLUDED.progress_percent,
           status = EXCLUDED.status,
           completed = EXCLUDED.completed,
           completed_lesson_ids = EXCLUDED.completed_lesson_ids,
           last_accessed_lesson_id = EXCLUDED.last_accessed_lesson_id,
           completed_at = CASE WHEN EXCLUDED.completed = TRUE THEN CURRENT_TIMESTAMP ELSE resq_user_course_progress.completed_at END,
           updated_at = CURRENT_TIMESTAMP`,
        [userId, courseId, courseProgressPercent, status, courseCompleted, JSON.stringify(completedIds), String(lessonDbId)]
      );
    }

    return NextResponse.json({
      success: true,
      materialId,
      materialCompleted: isCompleted,
      progressPercent,
      lessonCompleted,
      courseProgressPercent,
      courseCompleted,
    });
  } catch (error: any) {
    console.error("Material completion error:", error);
    return NextResponse.json({ error: "Failed to update material completion" }, { status: 500 });
  }
}
