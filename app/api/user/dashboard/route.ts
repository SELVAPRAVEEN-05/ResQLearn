import { NextResponse } from "next/server";
import { getSessionUser, getUserById } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
  }

  const userId = session.id;
  const user = await getUserById(userId);

  // 1. Get courses with progress
  const coursesRes = await query(
    `SELECT c.*, 
       COALESCE(p.progress_percent, 0) as progress,
       COALESCE(p.status, 'not-started') as user_status
     FROM resq_courses c
     LEFT JOIN resq_user_course_progress p ON c.id = p.course_id AND p.user_id = $1
     WHERE c.is_published = TRUE
     ORDER BY c.id ASC`,
    [userId]
  );

  // 2. Get active alerts with read status
  const alertsRes = await query(
    `SELECT a.*, 
       CASE WHEN r.user_id IS NOT NULL THEN TRUE ELSE FALSE END as read
     FROM resq_alerts a
     LEFT JOIN resq_user_alert_reads r ON a.id = r.alert_id AND r.user_id = $1
     WHERE a.is_active = TRUE
     ORDER BY a.created_at DESC`,
    [userId]
  );

  // 3. Get quiz attempts stats
  const attemptsRes = await query(
    `SELECT qa.*, q.title as quiz_title, q.slug as quiz_slug
     FROM resq_quiz_attempts qa
     JOIN resq_quizzes q ON qa.quiz_id = q.id
     WHERE qa.user_id = $1
     ORDER BY qa.created_at DESC`,
    [userId]
  );

  const publishedCourses = coursesRes.rows;
  const availableCoursesCount = publishedCourses.length;
  const startedCourses = publishedCourses.filter(c => Number(c.progress) > 0 && Number(c.progress) < 100);
  const startedCoursesCount = startedCourses.length;
  const completedCourses = publishedCourses.filter(c => Number(c.progress) === 100);
  const completedCoursesCount = completedCourses.length;

  const totalCourseProgressSum = publishedCourses.reduce((acc, c) => acc + Number(c.progress || 0), 0);
  const overallLearningProgress = availableCoursesCount > 0 ? Math.round(totalCourseProgressSum / availableCoursesCount) : 0;

  const attempts = attemptsRes.rows;
  const totalAttempts = attempts.length;
  const totalScoreRatio = attempts.reduce((acc, a) => acc + (a.score / (a.total || 1)), 0);
  const avgQuizScore = totalAttempts > 0 ? Math.round((totalScoreRatio / totalAttempts) * 100) : 0;
  const bestQuizScore = totalAttempts > 0 ? Math.round(Math.max(...attempts.map(a => a.score / (a.total || 1))) * 100) : 0;

  const inProgressCourse = startedCourses[0] || (completedCoursesCount < availableCoursesCount ? publishedCourses.find(c => Number(c.progress) === 0) : publishedCourses[0]) || null;

  return NextResponse.json({
    profile: user || { name: "Student", preparedness_score: 0 },
    stats: {
      availableCoursesCount,
      startedCoursesCount,
      completedCoursesCount,
      overallLearningProgress,
      avgQuizScore,
      bestQuizScore,
      totalAttempts,
    },
    courses: publishedCourses,
    inProgressCourse,
    alerts: alertsRes.rows,
    recentAttempts: attempts.slice(0, 5),
  });
}
