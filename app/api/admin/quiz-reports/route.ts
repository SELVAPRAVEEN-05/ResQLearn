import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const reportsRes = await query(
      `SELECT qa.id, qa.score, qa.total, qa.passed, qa.created_at,
              u.name as user_name, u.email as user_email, u.institution,
              q.title as quiz_title, q.category
       FROM resq_quiz_attempts qa
       JOIN resq_users u ON qa.user_id = u.id
       JOIN resq_quizzes q ON qa.quiz_id = q.id
       ORDER BY qa.created_at DESC`
    );

    const attemptsCount = reportsRes.rows.length;
    const passedCount = reportsRes.rows.filter(r => r.passed).length;
    const passRate = attemptsCount > 0 ? Math.round((passedCount / attemptsCount) * 100) : 100;

    return NextResponse.json({
      summary: {
        totalAttempts: attemptsCount,
        passRate: `${passRate}%`,
        topCategory: "Earthquake Safety",
      },
      reports: reportsRes.rows,
    });
  } catch (error: any) {
    console.error("Quiz reports error:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}
