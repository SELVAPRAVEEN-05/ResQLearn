"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Timer } from "lucide-react";

const questions = [
  {
    text: "What should you do first when a flood warning is issued?",
    options: ["Move to higher ground", "Wait until water enters the house", "Drive through flooded roads", "Ignore the warning"],
  },
  {
    text: "How much moving water can knock an adult down?",
    options: ["6 inches", "2 feet", "5 feet", "It never can"],
  },
  {
    text: "What's the safest way to monitor a flood emergency?",
    options: ["Social media rumors", "Battery-powered or NOAA weather radio", "Waiting for a neighbor to tell you", "Checking once a day"],
  },
];

export default function QuizInProgressPage(props: { params: any }) {
  const { params } = props;
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const question = questions[current % questions.length];
  const total = 10;
  const questionNumber = current + 1;
  const progress = (questionNumber / total) * 100;

  const handleNext = () => {
    if (questionNumber >= total) {
      router.push(`/user/quiz/${params.slug}/result`);
      return;
    }
    setCurrent((c) => c + 1);
    setSelected(null);
  };

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#111827]">Question {questionNumber} of {total}</h1>
        <span className="flex items-center gap-1.5 rounded-full bg-[#FEE2E2] px-3 py-1.5 text-sm font-semibold text-[#DC2626]">
          <Timer size={14} /> 08:45
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
              onClick={() => setSelected(i)}
              className={
                selected === i
                  ? "flex w-full items-center gap-3 rounded-2xl border-2 border-[#10B981] bg-[#F0FDF4] px-4 py-3.5 text-left text-sm font-medium text-[#111827]"
                  : "flex w-full items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3.5 text-left text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
              }
            >
              <span
                className={
                  selected === i
                    ? "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[#10B981]"
                    : "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[#D1D5DB]"
                }
              >
                {selected === i && <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />}
              </span>
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleNext}
          disabled={selected === null}
          className="flex items-center gap-2 rounded-2xl bg-[#10B981] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0E9F72] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </section>
  );
}