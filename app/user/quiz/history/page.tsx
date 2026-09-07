"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Droplet, Wind, Zap, Flame, Sun, ChevronRight, RotateCw } from "lucide-react";

interface AttemptItem {
  id: string;
  quizSlug: string;
  quizTitle: string;
  category: string;
  score: number;
  total: number;
  passed: boolean;
  date: string;
}

const filters = ["All", "Flood", "Cyclone", "Earthquake", "Fire"];

const getIcon = (title: string) => {
  const l = title.toLowerCase();
  if (l.includes("flood")) return Droplet;
  if (l.includes("cyclone") || l.includes("wind") || l.includes("storm")) return Wind;
  if (l.includes("earthquake") || l.includes("seismic")) return Zap;
  if (l.includes("fire")) return Flame;
  return Sun;
};

export default function QuizHistoryPage() {
  const [quizAttempts, setQuizAttempts] = useState<AttemptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("All");

  useEffect(() => {
    fetch("/api/quizzes/history")
      .then((r) => (r.ok ? r.json() : { attempts: [] }))
      .then((data) => {
        setQuizAttempts(data.attempts || []);
        setLoading(false);
      })
      .catch((e) => {
        console.error("Error loading quiz history:", e);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <RotateCw size={28} className="animate-spin text-[#10B981] mb-2" />
        <p className="text-sm font-semibold text-[#111827]">Loading assessment history...</p>
      </div>
    );
  }

  const totalAttempts = quizAttempts.length;
  const avgScore =
    totalAttempts > 0
      ? Math.round((quizAttempts.reduce((acc, a) => acc + a.score / (a.total || 1), 0) / totalAttempts) * 100)
      : 0;

  const passedAttempts = quizAttempts.filter((a) => a.passed).length;
  const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;

  const filteredAttempts = quizAttempts.filter((a) => {
    if (selectedFilter === "All") return true;
    return (
      a.quizTitle.toLowerCase().includes(selectedFilter.toLowerCase()) ||
      (a.category && a.category.toLowerCase().includes(selectedFilter.toLowerCase()))
    );
  });

  return (
    <section className="space-y-4 animate-[fadeIn_0.5s_ease-out] pb-10">
      <div className="flex items-center gap-3">
        <Link
          href="/user/quiz"
          className="inline-flex items-center justify-center rounded-full border border-[#E5E7EB] bg-white p-2 text-[#111827] transition hover:bg-[#F3F4F6]"
          aria-label="Back to quiz dashboard"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#6B7280]">History</p>
          <h1 className="text-2xl font-black text-[#111827]">Quiz History</h1>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-[#E5E7EB] rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="text-center">
          <p className="text-xl font-bold text-[#10B981]">{avgScore}%</p>
          <p className="mt-1 text-xs text-[#6B7280]">Avg. Score</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-[#111827]">{totalAttempts}</p>
          <p className="mt-1 text-xs text-[#6B7280]">Attempts</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-[#10B981]">{passRate}%</p>
          <p className="mt-1 text-xs text-[#6B7280]">Pass Rate</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setSelectedFilter(f)}
            className={
              selectedFilter === f
                ? "shrink-0 rounded-full bg-[#10B981] px-4 py-2 text-xs font-bold text-white shadow-xs"
                : "shrink-0 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-xs font-semibold text-[#6B7280] hover:text-[#111827]"
            }
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredAttempts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#D1D5DB] p-8 text-center bg-white mt-4 space-y-2">
            <p className="text-sm font-bold text-[#111827]">No quiz attempts yet.</p>
            <p className="text-xs text-[#6B7280]">Complete an assessment to build your official safety record.</p>
            <Link
              href="/user/quiz"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#10B981] px-4 py-2 text-xs font-bold text-white hover:bg-[#0E9F72] mt-2"
            >
              Start Quiz
            </Link>
          </div>
        ) : (
          filteredAttempts.map((a) => {
            const Icon = getIcon(a.quizTitle);
            const scorePercent = Math.round((a.score / (a.total || 1)) * 100);
            const isPassed = a.passed;
            const dateStr = new Date(a.date).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <Link
                key={a.id}
                href={`/user/quiz/${a.quizSlug}/result?attemptId=${a.id}`}
                className="flex w-full items-center justify-between gap-3 rounded-3xl border border-[#E5E7EB] bg-white p-4 text-left shadow-sm transition hover:bg-[#F9FAFB]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6]">
                    <Icon size={18} className="text-[#111827]" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#111827]">{a.quizTitle}</p>
                    <p className="mt-0.5 text-xs text-[#6B7280]">
                      {a.score}/{a.total} · {scorePercent}% · {dateStr}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className="rounded-full px-2.5 py-1 text-[11px] font-bold"
                    style={{
                      backgroundColor: isPassed ? "#D1FAE5" : "#FEE2E2",
                      color: isPassed ? "#047857" : "#DC2626",
                    }}
                  >
                    {isPassed ? "Passed" : "Failed"}
                  </span>
                  <ChevronRight size={16} className="text-[#9CA3AF]" />
                </div>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
}