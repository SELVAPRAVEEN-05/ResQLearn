import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized. Please log in to submit assessments." }, { status: 401 });
  }
  const userId = session.id;

  try {
    const body = await request.json();
    const { answers, score, total } = body; 
    // answers can be: { [questionId: string]: number } or array

    const quizRes = await query("SELECT id, title FROM resq_quizzes WHERE slug = $1", [slug]);
    if (quizRes.rows.length === 0) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }
    const quiz = quizRes.rows[0];

    // Fetch official questions with correct answers
    const questionsRes = await query(
      "SELECT question_id as id, correct_answer_index, explanation FROM resq_quiz_questions WHERE quiz_id = $1",
      [quiz.id]
    );

    let calculatedScore = 0;
    const totalQuestions = questionsRes.rows.length;
    const questionReview = [];

    for (const q of questionsRes.rows) {
      const userSelected = answers ? answers[q.id] : undefined;
      const isCorrect = userSelected === q.correct_answer_index;
      if (isCorrect) calculatedScore++;

      questionReview.push({
        questionId: q.id,
        userSelected,
        correctAnswerIndex: q.correct_answer_index,
        isCorrect,
        explanation: q.explanation,
      });
    }

    const finalScore = calculatedScore;
    const finalTotal = totalQuestions;
    const percentage = totalQuestions > 0 ? Math.round((finalScore / totalQuestions) * 100) : 0;
    const passed = percentage >= 70;

    const attemptRes = await query(
      `INSERT INTO resq_quiz_attempts (user_id, quiz_id, score, total, passed, answers)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, created_at`,
      [userId, quiz.id, finalScore, finalTotal, passed, JSON.stringify(questionReview)]
    );

    // Update preparedness score
    const pointsToAdd = passed ? 10 : 3;
    await query(
      `UPDATE resq_users 
       SET preparedness_score = LEAST(100, preparedness_score + $1) 
       WHERE id = $2`,
      [pointsToAdd, userId]
    );

    return NextResponse.json({
      message: "Quiz submitted successfully",
      attemptId: attemptRes.rows[0].id.toString(),
      score: finalScore,
      total: finalTotal,
      passed,
      review: questionReview,
    });
  } catch (error: any) {
    console.error("Quiz submission error:", error);
    return NextResponse.json({ error: "Failed to submit quiz" }, { status: 500 });
  }
}
