"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Timer, ArrowLeft } from "lucide-react";
import { useMockData } from "@/contexts/MockDataContext";

export default function QuizInProgressPage(props: { params: Promise<{ slug: string }> }) {
  const params = use(props.params);
  const { quizzes, submitQuiz } = useMockData();
  const router = useRouter();
  
  const quiz = quizzes.find(q => q.slug === params.slug);

  const [current, setCurrent] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});

  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
        <p className="text-[#6B7280]">Quiz not found.</p>
        <button onClick={() => router.back()} className="text-[#10B981] font-semibold flex items-center gap-2">
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  const question = quiz.questions[current];
  const total = quiz.questions.length;
  const questionNumber = current + 1;
  const progress = (questionNumber / total) * 100;
  
  const currentSelection = selectedAnswers[current];

  const handleNext = () => {
    if (questionNumber >= total) {
      // Calculate score
      let score = 0;
      quiz.questions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctAnswerIndex) {
          score++;
        }
      });
      
      const attemptId = submitQuiz(quiz.slug, score, total);
      router.push(`/user/quiz/${params.slug}/result?attemptId=${attemptId}`);
      return;
    }
    setCurrent((c) => c + 1);
  };

  const handleSelect = (index: number) => {
    setSelectedAnswers(prev => ({ ...prev, [current]: index }));
  };

  return (
    <section className="space-y-5 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#111827]">Question {questionNumber} of {total}</h1>
        <span className="flex items-center gap-1.5 rounded-full bg-[#FEE2E2] px-3 py-1.5 text-sm font-semibold text-[#DC2626]">
          <Timer size={14} /> Focus Mode
        </span>
      </div>

      <div className="h-2 rounded-full bg-[#F3F4F6]">
        <div className="h-2 rounded-full bg-[#10B981] transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <p className="text-base font-semibold leading-6 text-[#111827]">{question.text}</p>

        <div className="mt-5 space-y-3">
          {question.options.map((option, i) => (
            <button
              key={option}
              onClick={() => handleSelect(i)}
              className={
                currentSelection === i
                  ? "flex w-full items-center gap-3 rounded-2xl border-2 border-[#10B981] bg-[#F0FDF4] px-4 py-3.5 text-left text-sm font-medium text-[#111827]"
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
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrent(c => Math.max(0, c - 1))}
          disabled={current === 0}
          className="flex items-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-6 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentSelection === undefined}
          className="flex items-center gap-2 rounded-2xl bg-[#10B981] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0E9F72] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {questionNumber >= total ? "Submit" : "Next →"}
        </button>
      </div>
    </section>
  );
}