import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const quizzesRes = await query(
      `SELECT q.id, q.slug, q.title, q.category, q.difficulty,
              COUNT(qq.id)::int as question_count
       FROM resq_quizzes q
       LEFT JOIN resq_quiz_questions qq ON q.id = qq.quiz_id
       GROUP BY q.id
       ORDER BY q.id ASC`
    );

    const quizzes = [];
    for (const q of quizzesRes.rows) {
      const qQuestions = await query(
        `SELECT question_id as id, text, options, explanation
         FROM resq_quiz_questions
         WHERE quiz_id = $1
         ORDER BY order_index ASC`,
        [q.id]
      );
      quizzes.push({
        ...q,
        questions: qQuestions.rows.map((item) => ({
          id: item.id,
          text: item.text,
          options: typeof item.options === 'string' ? JSON.parse(item.options) : item.options,
          explanation: item.explanation,
        })),
      });
    }

    return NextResponse.json({ quizzes });
  } catch (error: any) {
    console.error("Quizzes fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch quizzes" }, { status: 500 });
  }
}
