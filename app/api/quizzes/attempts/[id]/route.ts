import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.id;
  const attemptId = parseInt(id, 10);
  if (isNaN(attemptId)) {
    return NextResponse.json({ error: "Invalid attempt ID" }, { status: 400 });
  }

  try {
    const attemptRes = await query(
      `SELECT qa.id, qa.user_id, qa.quiz_id, qa.score, qa.total, qa.passed, qa.answers, qa.created_at,
              q.slug as "quizSlug", q.title as "quizTitle", q.category as "quizCategory", q.difficulty as "quizDifficulty",
              u.name as "userName"
       FROM resq_quiz_attempts qa
       JOIN resq_quizzes q ON qa.quiz_id = q.id
       JOIN resq_users u ON qa.user_id = u.id
       WHERE qa.id = $1 AND (qa.user_id = $2 OR $3 = 'admin')`,
      [attemptId, userId, session.role || 'student']
    );

    if (attemptRes.rows.length === 0) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    const row = attemptRes.rows[0];
    const answers = typeof row.answers === "string" ? JSON.parse(row.answers) : row.answers;

    return NextResponse.json({
      attempt: {
        id: row.id.toString(),
        userId: row.user_id,
        userName: row.userName,
        quizId: row.quiz_id,
        quizSlug: row.quizSlug,
        quizTitle: row.quizTitle,
        category: row.quizCategory,
        difficulty: row.quizDifficulty,
        score: row.score,
        total: row.total,
        passed: row.passed,
        percentage: Math.round((row.score / (row.total || 1)) * 100),
        answers: answers || [],
        createdAt: row.created_at,
      },
    });
  } catch (error: any) {
    console.error("Attempt fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch attempt" }, { status: 500 });
  }
}
