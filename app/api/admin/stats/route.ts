import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
  }

  try {
    const studentsRes = await query("SELECT COUNT(*)::int as count FROM resq_users WHERE role = 'student'");
    const totalUsersRes = await query("SELECT COUNT(*)::int as count FROM resq_users");
    const activeUsersRes = await query("SELECT COUNT(*)::int as count FROM resq_users WHERE status = 'Active'");
    
    const coursesRes = await query("SELECT COUNT(*)::int as total, COUNT(CASE WHEN is_published = TRUE THEN 1 END)::int as published FROM resq_courses");
    const lessonsRes = await query("SELECT COUNT(*)::int as count FROM resq_lessons");
    const materialsRes = await query("SELECT COUNT(*)::int as count FROM resq_materials");
    
    const completedCoursesRes = await query("SELECT COUNT(*)::int as count FROM resq_user_course_progress WHERE completed = TRUE");
    const avgCourseProgressRes = await query("SELECT AVG(progress_percent)::float as avg_progress FROM resq_user_course_progress");

    const quizAttemptsRes = await query(
      `SELECT COUNT(*)::int as total_attempts,
              AVG(score::float / NULLIF(total, 0)) as avg_score,
              COUNT(CASE WHEN passed = TRUE THEN 1 END)::int as total_passed,
              COUNT(CASE WHEN passed = FALSE THEN 1 END)::int as total_failed
       FROM resq_quiz_attempts`
    );

    const activeAlertsRes = await query("SELECT COUNT(*)::int as count FROM resq_alerts WHERE is_active = TRUE");

    const totalStudents = studentsRes.rows[0]?.count || 0;
    const totalCourses = coursesRes.rows[0]?.total || 0;
    const publishedCourses = coursesRes.rows[0]?.published || 0;
    const totalCompletedCourses = completedCoursesRes.rows[0]?.count || 0;
    const avgProgress = avgCourseProgressRes.rows[0]?.avg_progress 
      ? Math.round(Number(avgCourseProgressRes.rows[0].avg_progress)) 
      : 0;

    const qaRow = quizAttemptsRes.rows[0] || {};
    const totalQuizAttempts = qaRow.total_attempts || 0;
    const averageQuizScore = qaRow.avg_score ? Math.round(Number(qaRow.avg_score) * 100) : 0;
    const totalPassed = qaRow.total_passed || 0;
    const totalFailed = qaRow.total_failed || 0;

    // Student performance breakdown from stored database records
    const studentsPerfRes = await query(
      `SELECT u.id, u.name, u.email, u.status, u.preparedness_score,
              COALESCE(AVG(p.progress_percent), 0)::int as avg_course_progress,
              COUNT(CASE WHEN p.completed = TRUE THEN 1 END)::int as completed_courses,
              COUNT(DISTINCT qa.id)::int as quiz_attempts,
              COALESCE(AVG(qa.score::float / NULLIF(qa.total, 0)), 0)::float as avg_quiz_score,
              COALESCE(MAX(qa.score::float / NULLIF(qa.total, 0)), 0)::float as best_quiz_score
       FROM resq_users u
       LEFT JOIN resq_user_course_progress p ON u.id = p.user_id
       LEFT JOIN resq_quiz_attempts qa ON u.id = qa.user_id
       WHERE u.role = 'student'
       GROUP BY u.id, u.name, u.email, u.status, u.preparedness_score
       ORDER BY u.id ASC`
    );

    const studentPerformance = studentsPerfRes.rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      status: row.status,
      preparednessScore: row.preparedness_score,
      courseProgress: Number(row.avg_course_progress) || 0,
      completedCourses: Number(row.completed_courses) || 0,
      quizAttempts: Number(row.quiz_attempts) || 0,
      averageScore: Math.round((Number(row.avg_quiz_score) || 0) * 100),
      bestScore: Math.round((Number(row.best_quiz_score) || 0) * 100),
    }));

    return NextResponse.json({
      totalStudents,
      totalUsers: totalUsersRes.rows[0]?.count || 0,
      activeUsers: activeUsersRes.rows[0]?.count || 0,
      totalCourses,
      publishedCourses,
      totalLessons: lessonsRes.rows[0]?.count || 0,
      totalMaterials: materialsRes.rows[0]?.count || 0,
      totalCompletedCourses,
      courseCompletionPercentage: avgProgress,
      totalQuizAttempts,
      averageQuizScore,
      totalPassed,
      totalFailed,
      activeAlerts: activeAlertsRes.rows[0]?.count || 0,
      studentPerformance,
    });
  } catch (error: any) {
    console.error("Admin stats calculation error:", error);
    return NextResponse.json({ error: "Failed to calculate admin stats" }, { status: 500 });
  }
}
