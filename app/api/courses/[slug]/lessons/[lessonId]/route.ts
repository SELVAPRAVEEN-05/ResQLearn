import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; lessonId: string }> }
) {
  const { slug, lessonId } = await params;

  try {
    const courseRes = await query("SELECT id, title, slug FROM resq_courses WHERE slug = $1", [slug]);
    if (courseRes.rows.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const course = courseRes.rows[0];

    const lessonsRes = await query(
      `SELECT lesson_id as id, title, type, content, order_index 
       FROM resq_lessons 
       WHERE course_id = $1 
       ORDER BY order_index ASC`,
      [course.id]
    );

    const lessons = lessonsRes.rows;
    const currentIndex = lessons.findIndex((l) => l.id === lessonId);

    if (currentIndex === -1) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const currentLesson = lessons[currentIndex];
    const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

    return NextResponse.json({
      course,
      lesson: currentLesson,
      prevLesson: prevLesson ? { id: prevLesson.id, title: prevLesson.title } : null,
      nextLesson: nextLesson ? { id: nextLesson.id, title: nextLesson.title } : null,
      totalLessons: lessons.length,
      currentPosition: currentIndex + 1,
    });
  } catch (error: any) {
    console.error("Lesson fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch lesson" }, { status: 500 });
  }
}
