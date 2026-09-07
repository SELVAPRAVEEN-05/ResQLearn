import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ attempts: [] });
  }

  const userId = session.id;

  try {
    const historyRes = await query(
      `SELECT qa.id, qa.score, qa.total, qa.passed, qa.created_at as date,
              q.slug as "quizSlug", q.title as "quizTitle", q.category
       FROM resq_quiz_attempts qa
       JOIN resq_quizzes q ON qa.quiz_id = q.id
       WHERE qa.user_id = $1
       ORDER BY qa.created_at DESC`,
      [userId]
    );

    return NextResponse.json({
      attempts: historyRes.rows.map((row) => ({
        id: row.id.toString(),
        quizSlug: row.quizSlug,
        quizTitle: row.quizTitle,
        category: row.category,
        score: row.score,
        total: row.total,
        passed: row.passed,
        date: row.date,
      })),
    });
  } catch (error: any) {
    console.error("Quiz history error:", error);
    return NextResponse.json({ error: "Failed to fetch quiz history" }, { status: 500 });
  }
}
