import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const quizRes = await query(
      "SELECT id, slug, title, category, difficulty FROM resq_quizzes WHERE slug = $1",
      [slug]
    );

    if (quizRes.rows.length === 0) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const quiz = quizRes.rows[0];

    const questionsRes = await query(
      `SELECT question_id as id, text, options, explanation
       FROM resq_quiz_questions
       WHERE quiz_id = $1
       ORDER BY order_index ASC`,
      [quiz.id]
    );

    return NextResponse.json({
      quiz: {
        ...quiz,
        questions: questionsRes.rows.map((q) => ({
          id: q.id,
          text: q.text,
          options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
          explanation: q.explanation,
        })),
      },
    });
  } catch (error: any) {
    console.error("Quiz detail error:", error);
    return NextResponse.json({ error: "Failed to fetch quiz details" }, { status: 500 });
  }
}
