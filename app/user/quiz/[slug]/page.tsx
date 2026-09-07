"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Timer, ArrowLeft, RotateCw } from "lucide-react";

interface Question {
  id: string;
  text: string;
  options: string[];
  explanation: string;
}

interface QuizDetail {
  id: number;
  slug: string;
  title: string;
  category: string;
  difficulty: string;
  questions: Question[];
}

export default function QuizInProgressPage(props: { params: Promise<{ slug: string }> }) {
  const params = use(props.params);
  const router = useRouter();

  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/quizzes/${params.slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.quiz) {
          setQuiz(data.quiz);
        }
        setLoading(false);
      })
      .catch((e) => {
        console.error("Error loading quiz:", e);
        setLoading(false);
      });
  }, [params.slug]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <RotateCw size={28} className="animate-spin text-[#10B981] mb-2" />
        <p className="text-sm font-semibold text-[#111827]">Loading assessment questions...</p>
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
        <p className="text-[#6B7280] text-sm">Quiz questions not found.</p>
        <button
          onClick={() => router.push("/user/quiz")}
          className="text-[#10B981] font-semibold text-xs flex items-center gap-2 hover:underline"
        >
          <ArrowLeft size={16} /> Back to Assessments
        </button>
      </div>
    );
  }

  const question = quiz.questions[current];
  const total = quiz.questions.length;
  const questionNumber = current + 1;
  const progress = (questionNumber / total) * 100;

  const currentSelection = question ? selectedAnswers[question.id] : undefined;

  const handleNext = async () => {
    if (questionNumber >= total) {
      setSubmitting(true);
      try {
        const res = await fetch(`/api/quizzes/${quiz.slug}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: selectedAnswers }),
        });

        if (res.ok) {
          const data = await res.json();
          router.push(`/user/quiz/${quiz.slug}/result?attemptId=${data.attemptId}`);
        } else {
          const err = await res.json().catch(() => ({ error: "Failed to submit" }));
          alert(err.error || "Submission failed");
          setSubmitting(false);
        }
      } catch (e: any) {
        console.error("Submission error:", e);
        alert("Failed to submit quiz assessment");
        setSubmitting(false);
      }
      return;
    }
    setCurrent((c) => c + 1);
  };

  const handleSelect = (index: number) => {
    if (!question) return;
    setSelectedAnswers((prev) => ({ ...prev, [question.id]: index }));
  };

  return (
    <section className="space-y-5 animate-[fadeIn_0.5s_ease-out] pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#111827]">Question {questionNumber} of {total}</h1>
          <p className="text-xs text-[#6B7280]">{quiz.title}</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-[#FEE2E2] px-3 py-1.5 text-xs font-bold text-[#DC2626]">
          <Timer size={13} /> Focus Mode
        </span>
      </div>

      <div className="h-2 rounded-full bg-[#F3F4F6]">
        <div className="h-2 rounded-full bg-[#10B981] transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <p className="text-base font-bold leading-6 text-[#111827]">{question.text}</p>

        <div className="mt-5 space-y-3">
          {question.options.map((option, i) => (
            <button
              key={option}
              onClick={() => handleSelect(i)}
              className={
                currentSelection === i
                  ? "flex w-full items-center gap-3 rounded-2xl border-2 border-[#10B981] bg-[#F0FDF4] px-4 py-3.5 text-left text-sm font-semibold text-[#111827]"
                  : "flex w-full items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3.5 text-left text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
              }
            >
              <span
                className={
                  currentSelection === i
                    ? "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[#10B981]"
                    : "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[#D1D5DB]"
                }
              >
                {currentSelection === i && <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />}
              </span>
              <span>{option}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0 || submitting}
          className="flex items-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-6 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentSelection === undefined || submitting}
          className="flex items-center gap-2 rounded-2xl bg-[#10B981] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#0E9F72] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? (
            <>
              <RotateCw size={14} className="animate-spin" /> Submitting...
            </>
          ) : questionNumber >= total ? (
            "Submit Assessment"
          ) : (
            "Next Question →"
          )}
        </button>
      </div>
    </section>
  );
}