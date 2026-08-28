"use client";

import Link from "next/link";
import { ListChecks, CheckCircle2, XCircle, Timer, Award, Download, Eye, ArrowLeft } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMockData } from "@/contexts/MockDataContext";
import { use } from "react";

export default function QuizResultPage(props: { params: Promise<{ slug: string }> }) {
  const params = use(props.params);
  const searchParams = useSearchParams();
  const attemptId = searchParams.get('attemptId');
  const router = useRouter();
  
  const { quizAttempts, quizzes } = useMockData();
  
  const attempt = quizAttempts.find(a => a.id === attemptId);
  const quiz = quizzes.find(q => q.slug === params.slug);

  if (!attempt || !quiz) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
        <p className="text-[#6B7280]">Result not found.</p>
        <button onClick={() => router.back()} className="text-[#10B981] font-semibold flex items-center gap-2">
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  const scorePercent = Math.round((attempt.score / attempt.total) * 100);
  const circumference = 2 * Math.PI * 54;
  const dash = (scorePercent / 100) * circumference;
  const isPassed = scorePercent >= 70;

  const stats = [
    { label: "Total Questions", value: attempt.total.toString(), icon: ListChecks, iconColor: "#6B7280" },
    { label: "Correct", value: attempt.score.toString(), icon: CheckCircle2, iconColor: "#10B981" },
    { label: "Incorrect", value: (attempt.total - attempt.score).toString(), icon: XCircle, iconColor: "#DC2626" },
    { label: "Time Taken", value: "2m 15s", icon: Timer, iconColor: "#6B7280" }, // Mocked time
  ];

  return (
    <section className="space-y-5 animate-[fadeIn_0.5s_ease-out]">
      <div className="text-center">
        <h1 className="text-xl font-bold text-[#111827]">Quiz Result</h1>
        <p className="mt-1 text-sm text-[#6B7280]">{quiz.title}</p>
      </div>

      <div className="rounded-3xl border border-[#E5E7EB] bg-gradient-to-b from-white to-[#ECFDF5] p-8 shadow-sm relative overflow-hidden">
        <div className="mx-auto flex h-40 w-40 items-center justify-center relative z-10">
          <svg viewBox="0 0 120 120" className="h-40 w-40 -rotate-90">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#F3F4F6" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={isPassed ? "#10B981" : "#F59E0B"}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <p className="text-3xl font-bold text-[#111827]">{scorePercent}%</p>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
              {isPassed ? 'Passed' : 'Review Needed'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl border border-[#E5E7EB] bg-white p-4 text-center shadow-sm">
              <Icon size={18} className="mx-auto" style={{ color: s.iconColor }} />
              <p className="mt-2 text-xl font-bold text-[#111827]">{s.value}</p>
              <p className="mt-1 text-xs text-[#6B7280]">{s.label}</p>
            </div>
          );
        })}
      </div>

      {isPassed && (
        <div className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D1FAE5] text-[#10B981]">
              <Award size={20} />
            </span>
            <div>
              <p className="text-sm font-bold text-[#111827]">{quiz.category} Safety Certified!</p>
              <p className="mt-1 text-sm leading-6 text-[#6B7280]">You've successfully completed the module.</p>
            </div>
          </div>
          <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#F3F4F6] px-4 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#E5E7EB]" onClick={() => alert("Mock: Downloading certificate...")}>
            <Download size={16} /> Download Certificate
          </button>
        </div>
      )}

      <div className="space-y-3">
        <button 
          onClick={() => alert("Mock: Review answers modal...")}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
        >
          <Eye size={16} /> Review Answers
        </button>
        
        <Link
          href={`/user/quiz/${params.slug}`}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#10B981] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0E9F72]"
        >
          Retake Quiz
        </Link>
        <Link
          href="/user/quiz"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
        >
          Back to Quizzes
        </Link>
      </div>
    </section>
  );
}