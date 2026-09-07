"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardCheck, BarChart3, Flame, Droplet, Wind, Zap, Sun, RotateCw } from "lucide-react";

interface QuizItem {
  id: number;
  slug: string;
  title: string;
  category: string;
  difficulty: string;
  question_count?: number;
  questions: Array<{
    id: string;
    text: string;
    options: string[];
    explanation: string;
  }>;
}

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

const getIcon = (category: string) => {
  switch (category) {
    case "Flood": return Droplet;
    case "Cyclone": return Wind;
    case "Earthquake": return Zap;
    case "Fire": return Flame;
    default: return Sun;
  }
};

const getCategoryStyles = (category: string) => {
  switch (category) {
    case "Flood": return { iconBg: "#DBEAFE", iconColor: "#2563EB" };
    case "Cyclone": return { iconBg: "#EDE9FE", iconColor: "#7C3AED" };
    case "Earthquake": return { iconBg: "#FFEDD5", iconColor: "#EA580C" };
    case "Fire": return { iconBg: "#FEE2E2", iconColor: "#DC2626" };
    default: return { iconBg: "#FEF9C3", iconColor: "#CA8A04" };
  }
};

export default function QuizDashboardPage() {
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<AttemptItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [qRes, hRes] = await Promise.all([
          fetch("/api/quizzes").then((r) => (r.ok ? r.json() : { quizzes: [] })),
          fetch("/api/quizzes/history").then((r) => (r.ok ? r.json() : { attempts: [] })),
        ]);

        setQuizzes(qRes.quizzes || []);
        setQuizAttempts(hRes.attempts || []);
      } catch (e) {
        console.error("Error loading quizzes:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <RotateCw size={28} className="animate-spin text-[#10B981] mb-2" />
        <p className="text-sm font-semibold text-[#111827]">Loading disaster assessments...</p>
      </div>
    );
  }

  const totalAttempts = quizAttempts.length;
  const avgScore =
    totalAttempts > 0
      ? Math.round((quizAttempts.reduce((acc, a) => acc + a.score / (a.total || 1), 0) / totalAttempts) * 100)
      : 0;

  const passedCount = quizAttempts.filter((a) => a.passed).length;
  const passRate = totalAttempts > 0 ? Math.round((passedCount / totalAttempts) * 100) : 0;

  const stats = [
    {
      label: "Tests Completed",
      value: totalAttempts.toString(),
      icon: ClipboardCheck,
      iconBg: "#EEF2FF",
      iconColor: "#6366F1",
    },
    {
      label: "Avg Score",
      value: `${avgScore}%`,
      trend: totalAttempts > 0 ? `${passRate}% pass rate` : undefined,
      icon: BarChart3,
      iconBg: "#D1FAE5",
      iconColor: "#10B981",
    },
  ];

  return (
    <section className="space-y-6 animate-[fadeIn_0.5s_ease-out] pb-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#111827]">Knowledge Assessment</h1>
          <p className="mt-1 text-sm text-[#6B7280]">Test your disaster readiness for verified certifications.</p>
        </div>
        <Link href="/user/quiz/history" className="shrink-0 text-xs font-bold text-[#10B981] hover:underline">
          History →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm"
            >
              <span
                className="inline-flex h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: stat.iconBg, color: stat.iconColor }}
              >
                <Icon size={18} />
              </span>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">{stat.label}</p>
              <div className="mt-1 flex items-baseline gap-2">
                <p className="text-2xl font-bold text-[#111827]">{stat.value}</p>
                {stat.trend && <span className="text-xs font-semibold text-[#10B981]">{stat.trend}</span>}
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <h2 className="text-lg font-bold text-[#111827]">Available Quizzes</h2>
        <div className="mt-3 space-y-3">
          {quizzes.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#D1D5DB] p-8 text-center bg-white">
              <ClipboardCheck size={32} className="mx-auto text-[#9CA3AF] mb-3" />
              <h3 className="text-sm font-bold text-[#111827]">No quizzes available yet.</h3>
              <p className="text-xs text-[#6B7280] mt-1">Check back later for new admin assessments.</p>
            </div>
          ) : (
            quizzes.map((q) => {
              const Icon = getIcon(q.category);
              const styles = getCategoryStyles(q.category);

              // Calculate best score for this quiz from actual database records
              const relatedAttempts = quizAttempts.filter((a) => a.quizSlug === q.slug);
              const bestScore =
                relatedAttempts.length > 0
                  ? Math.round(Math.max(...relatedAttempts.map((a) => a.score / (a.total || 1))) * 100) + "%"
                  : "--";

              return (
                <div key={q.slug} className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-2xl"
                        style={{ backgroundColor: styles.iconBg, color: styles.iconColor }}
                      >
                        <Icon size={18} />
                      </span>
                      <div>
                        <p className="text-base font-bold text-[#111827]">{q.title}</p>
                        <p className="text-xs text-[#6B7280]">{q.category} Assessment</p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        q.difficulty === "Easy"
                          ? "bg-[#D1FAE5] text-[#047857]"
                          : q.difficulty === "Medium"
                          ? "bg-[#FEF3C7] text-[#B45309]"
                          : "bg-[#FEE2E2] text-[#B91C1C]"
                      }`}
                    >
                      {q.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#F3F4F6] pt-3 text-sm">
                    <div>
                      <p className="text-xs text-[#6B7280]">Questions</p>
                      <p className="font-bold text-[#111827]">{q.questions?.length || q.question_count || 0}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#6B7280]">Best Score</p>
                      <p className={bestScore === "--" ? "font-semibold text-[#9CA3AF]" : "font-bold text-[#10B981]"}>
                        {bestScore}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/user/quiz/${q.slug}`}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-[#10B981] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0E9F72]"
                  >
                    Start Assessment →
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}