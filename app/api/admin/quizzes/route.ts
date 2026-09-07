import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const questionsRes = await query(
      `SELECT qq.id, qq.question_id, qq.text, qq.options, qq.correct_answer_index, qq.explanation,
              q.title as quiz_title, q.category
       FROM resq_quiz_questions qq
       JOIN resq_quizzes q ON qq.quiz_id = q.id
       ORDER BY qq.id ASC`
    );

    return NextResponse.json({
      questions: questionsRes.rows.map((q) => ({
        id: q.id.toString(),
        questionId: q.question_id,
        quizTitle: q.quiz_title,
        category: q.category,
        text: q.text,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
        correctAnswerIndex: q.correct_answer_index,
        explanation: q.explanation,
      })),
    });
  } catch (error: any) {
    console.error("Fetch admin questions error:", error);
    return NextResponse.json({ error: "Failed to fetch quiz questions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { quizSlug, text, options, correctAnswerIndex, explanation } = body;

    let quizRes = await query("SELECT id FROM resq_quizzes WHERE slug = $1", [quizSlug || "general-safety"]);
    if (quizRes.rows.length === 0) {
      // create fallback quiz
      quizRes = await query(
        "INSERT INTO resq_quizzes (slug, title, category, difficulty) VALUES ($1, $2, 'Fire', 'Medium') RETURNING id",
        [quizSlug || "general-safety", "General Preparedness Assessment"]
      );
    }

    const quizId = quizRes.rows[0].id;
    const questionId = `q_${Date.now()}`;

    const newQ = await query(
      `INSERT INTO resq_quiz_questions (question_id, quiz_id, text, options, correct_answer_index, explanation)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [questionId, quizId, text, JSON.stringify(options), correctAnswerIndex, explanation || ""]
    );

    return NextResponse.json({ message: "Question created", question: newQ.rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error("Create quiz question error:", error);
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 });
  }
}
