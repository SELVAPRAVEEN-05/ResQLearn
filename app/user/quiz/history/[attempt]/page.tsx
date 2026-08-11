import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, Timer } from "lucide-react";

const attemptDetails = {
  "flood-preparedness": {
    title: "Flood Preparedness",
    score: "9/10",
    percentage: 90,
    date: "Oct 24, 2023",
    passed: true,
    correct: 9,
    incorrect: 1,
    time: "6m 12s",
    summary: "Strong understanding of flood safety, with one missed detail on evacuation priority.",
  },
  "cyclone-basics": {
    title: "Cyclone Basics",
    score: "5/10",
    percentage: 50,
    date: "Oct 15, 2023",
    passed: false,
    correct: 5,
    incorrect: 5,
    time: "7m 08s",
    summary: "Review storm shelter procedure and warning signal recognition.",
  },
  "earthquake-response": {
    title: "Earthquake Response",
    score: "10/10",
    percentage: 100,
    date: "Sep 02, 2023",
    passed: true,
    correct: 10,
    incorrect: 0,
    time: "4m 42s",
    summary: "Excellent response. You clearly understand earthquake readiness.",
  },
};

export default function QuizHistoryDetailPage({ params }: { params: { attempt: string } }) {
  const detail = attemptDetails[params.attempt] ?? attemptDetails["flood-preparedness"];

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/user/quiz/history"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] text-[#111827] transition hover:bg-[#F3F4F6]"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">Quiz Detail</p>
          <h1 className="text-2xl font-bold text-[#111827]">{detail.title}</h1>
        </div>
      </div>

      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className={detail.passed ? "rounded-full bg-[#D1FAE5] px-3 py-1 text-sm font-semibold text-[#047857]" : "rounded-full bg-[#FEE2E2] px-3 py-1 text-sm font-semibold text-[#DC2626]"}>
            {detail.passed ? "Passed" : "Failed"}
          </span>
          <p className="text-sm text-[#6B7280]">{detail.date}</p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-[#F3F4F6] p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">Score</p>
            <p className="mt-2 text-3xl font-bold text-[#111827]">{detail.score}</p>
          </div>
          <div className="rounded-2xl bg-[#F3F4F6] p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">Time</p>
            <p className="mt-2 text-3xl font-bold text-[#111827]">{detail.time}</p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-[#E5E7EB] bg-white p-4">
          <p className="text-sm font-semibold text-[#111827]">Summary</p>
          <p className="mt-2 text-sm leading-6 text-[#6B7280]">{detail.summary}</p>
        </div>
      </div>
    </section>
  );
}
