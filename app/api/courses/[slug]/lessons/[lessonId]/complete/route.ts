import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string; lessonId: string }> }
) {
  const { slug, lessonId } = await params;
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
  }
  const userId = session.id;

  try {
    const isCourseNumeric = /^\d+$/.test(slug);
    const courseRes = await query(
      `SELECT id FROM resq_courses WHERE ${isCourseNumeric ? "id = $1 OR slug = $2" : "slug = $1"}`,
      isCourseNumeric ? [parseInt(slug, 10), slug] : [slug]
    );

    if (courseRes.rows.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const courseId = courseRes.rows[0].id;

    // Resolve actual lesson numeric id and lesson_id
    const isLessonNumeric = /^\d+$/.test(lessonId);
    const lessonRes = await query(
      `SELECT id, lesson_id FROM resq_lessons WHERE course_id = $1 AND ${isLessonNumeric ? "id = $2 OR lesson_id = $3" : "lesson_id = $2"}`,
      isLessonNumeric ? [courseId, parseInt(lessonId, 10), lessonId] : [courseId, lessonId]
    );

    if (lessonRes.rows.length === 0) {
      return NextResponse.json({ error: "Lesson not found in this course" }, { status: 404 });
    }

    const actualLessonDbId = lessonRes.rows[0].id;
    const actualLessonStringId = lessonRes.rows[0].lesson_id;

    // 1. Record in resq_user_lesson_progress
    await query(
      `INSERT INTO resq_user_lesson_progress (user_id, lesson_id, completed, completed_at, updated_at)
       VALUES ($1, $2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, lesson_id) DO UPDATE SET
         completed = TRUE,
         completed_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP`,
      [userId, actualLessonDbId]
    );

    // 2. Get total published lessons for this course
    const allLessonsRes = await query(
      "SELECT id, lesson_id FROM resq_lessons WHERE course_id = $1 AND is_published = TRUE",
      [courseId]
    );
    const totalLessons = allLessonsRes.rows.length;

    // 3. Get current completed list from course progress
    const progRes = await query(
      "SELECT completed_lesson_ids FROM resq_user_course_progress WHERE user_id = $1 AND course_id = $2",
      [userId, courseId]
    );

    let completedIds: string[] = [];
    if (progRes.rows.length > 0 && Array.isArray(progRes.rows[0].completed_lesson_ids)) {
      completedIds = progRes.rows[0].completed_lesson_ids;
    }

    // Include both identifiers to ensure client compatibility
    if (!completedIds.includes(String(actualLessonDbId))) {
      completedIds.push(String(actualLessonDbId));
    }
    if (!completedIds.includes(actualLessonStringId)) {
      completedIds.push(actualLessonStringId);
    }

    // Count unique completed lessons matching this course's lessons
    const completedLessonCount = allLessonsRes.rows.filter(
      (l) => completedIds.includes(String(l.id)) || completedIds.includes(l.lesson_id)
    ).length;

    const progressPercent = totalLessons > 0 ? Math.min(100, Math.round((completedLessonCount / totalLessons) * 100)) : 100;
    const isCompleted = progressPercent === 100;
    const status = isCompleted ? "completed" : "in-progress";

    await query(
      `INSERT INTO resq_user_course_progress (user_id, course_id, progress_percent, status, completed, completed_lesson_ids, last_accessed_lesson_id, started_at, completed_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, ${isCompleted ? "CURRENT_TIMESTAMP" : "NULL"}, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, course_id) DO UPDATE SET
         progress_percent = EXCLUDED.progress_percent,
         status = EXCLUDED.status,
         completed = EXCLUDED.completed,
         completed_lesson_ids = EXCLUDED.completed_lesson_ids,
         last_accessed_lesson_id = EXCLUDED.last_accessed_lesson_id,
         completed_at = CASE WHEN EXCLUDED.completed = TRUE THEN CURRENT_TIMESTAMP ELSE resq_user_course_progress.completed_at END,
         updated_at = CURRENT_TIMESTAMP`,
      [userId, courseId, progressPercent, status, isCompleted, JSON.stringify(completedIds), String(actualLessonDbId)]
    );

    // 4. Boost student preparedness score
    if (isCompleted) {
      await query(
        `UPDATE resq_users 
         SET preparedness_score = LEAST(100, preparedness_score + 15),
             certificates = certificates + 1
         WHERE id = $1`,
        [userId]
      );
    } else {
      await query(
        `UPDATE resq_users SET preparedness_score = LEAST(100, preparedness_score + 2) WHERE id = $1`,
        [userId]
      );
    }

    return NextResponse.json({
      message: "Lesson marked as complete",
      progressPercent,
      completed: isCompleted,
      status,
    });
  } catch (error: any) {
    console.error("Complete lesson error:", error);
    return NextResponse.json({ error: "Failed to complete lesson" }, { status: 500 });
  }
}
