"use client";

import Link from "next/link";
import { ClipboardCheck, BarChart3, Flame, Droplet, Wind, Zap, Sun } from "lucide-react";
import { useMockData } from "@/contexts/MockDataContext";

const getIcon = (category: string) => {
  switch (category) {
    case 'Flood': return Droplet;
    case 'Cyclone': return Wind;
    case 'Earthquake': return Zap;
    case 'Fire': return Flame;
    default: return Sun;
  }
};

const getCategoryStyles = (category: string) => {
  switch (category) {
    case 'Flood': return { iconBg: "#DBEAFE", iconColor: "#2563EB" };
    case 'Cyclone': return { iconBg: "#EDE9FE", iconColor: "#7C3AED" };
    case 'Earthquake': return { iconBg: "#FFEDD5", iconColor: "#EA580C" };
    case 'Fire': return { iconBg: "#FEE2E2", iconColor: "#DC2626" };
    default: return { iconBg: "#FEF9C3", iconColor: "#CA8A04" };
  }
};

export default function QuizDashboardPage() {
  const { quizzes, quizAttempts } = useMockData();

  const totalAttempts = quizAttempts.length;
  const avgScore = totalAttempts > 0 
    ? Math.round(quizAttempts.reduce((acc, a) => acc + (a.score / a.total), 0) / totalAttempts * 100) 
    : 0;

  const stats = [
    { label: "Tests Completed", value: totalAttempts.toString(), icon: ClipboardCheck, iconBg: "#EEF2FF", iconColor: "#6366F1" },
    { label: "Avg Score", value: `${avgScore}%`, trend: totalAttempts > 0 ? "+2%" : undefined, icon: BarChart3, iconBg: "#D1FAE5", iconColor: "#10B981" },
    { label: "Best Streak", value: "5", suffix: "days", icon: Flame, iconBg: "#FEF9C3", iconColor: "#CA8A04", cardBg: "#F3F4F6" },
  ];

  return (
    <section className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Knowledge Assessment</h1>
          <p className="mt-1 text-sm text-[#6B7280]">Test your readiness for critical scenarios.</p>
        </div>
        <Link href="/user/quiz/history" className="shrink-0 text-xs font-semibold text-[#10B981] hover:underline">
          History
        </Link>
      </div>

      <div className="space-y-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-3xl border border-[#E5E7EB] p-5 shadow-sm"
              style={{ backgroundColor: stat.cardBg ?? "#FFFFFF" }}
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: stat.iconBg, color: stat.iconColor }}>
                <Icon size={18} />
              </span>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">{stat.label}</p>
              <div className="mt-1 flex items-baseline gap-2">
                <p className="text-3xl font-bold text-[#111827]">{stat.value}</p>
                {stat.suffix && <span className="text-sm text-[#6B7280]">{stat.suffix}</span>}
                {stat.trend && <span className="text-sm font-semibold text-[#10B981]">↗ {stat.trend}</span>}
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
              <h3 className="text-sm font-bold text-[#111827]">No quizzes found</h3>
              <p className="text-xs text-[#6B7280] mt-1">Check back later for new assessments.</p>
            </div>
          ) : (
            quizzes.map((q) => {
              const Icon = getIcon(q.category);
              const styles = getCategoryStyles(q.category);
              
              // Calculate best score for this quiz
              const relatedAttempts = quizAttempts.filter(a => a.quizSlug === q.slug);
              const bestScore = relatedAttempts.length > 0 
                ? Math.round(Math.max(...relatedAttempts.map(a => a.score / a.total)) * 100) + "%" 
                : "--";

              return (
                <div key={q.slug} className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ backgroundColor: styles.iconBg, color: styles.iconColor }}>
                        <Icon size={18} />
                      </span>
                      <div>
                        <p className="text-base font-bold text-[#111827]">{q.title}</p>
                        <p className="text-xs text-[#6B7280]">{q.category} Assessment</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      q.difficulty === 'Easy' ? 'bg-[#D1FAE5] text-[#047857]' : 
                      q.difficulty === 'Medium' ? 'bg-[#FEF3C7] text-[#B45309]' : 'bg-[#FEE2E2] text-[#B91C1C]'
                    }`}>
                      {q.difficulty}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[#F3F4F6] pt-4 text-sm">
                    <div>
                      <p className="text-xs text-[#6B7280]">Questions</p>
                      <p className="font-semibold text-[#111827]">{q.questions.length}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#6B7280]">Best Score</p>
                      <p className={bestScore === "--" ? "font-semibold text-[#9CA3AF]" : "font-semibold text-[#10B981]"}>{bestScore}</p>
                    </div>
                  </div>

                  <Link
                    href={`/user/quiz/${q.slug}`}
                    className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-[#10B981] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0E9F72]"
                  >
                    Start →
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