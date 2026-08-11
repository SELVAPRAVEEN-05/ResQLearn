import Link from "next/link";
import { ClipboardCheck, BarChart3, Flame, Droplet, Wind, Zap, Sun } from "lucide-react";

const stats = [
  { label: "Tests Completed", value: "12", icon: ClipboardCheck, iconBg: "#EEF2FF", iconColor: "#6366F1" },
  { label: "Avg Score", value: "85%", trend: "+2%", icon: BarChart3, iconBg: "#D1FAE5", iconColor: "#10B981" },
  { label: "Best Streak", value: "5", suffix: "days", icon: Flame, iconBg: "#FEF9C3", iconColor: "#CA8A04", cardBg: "#F3F4F6" },
];

const quizzes = [
  {
    slug: "flood",
    title: "Flood",
    subtitle: "Urban & Coastal",
    icon: Droplet,
    iconBg: "#DBEAFE",
    iconColor: "#2563EB",
    difficulty: "Med",
    diffBg: "#F3F4F6",
    diffColor: "#6B7280",
    questions: 10,
    bestScore: "90%",
    primary: false,
  },
  {
    slug: "cyclone",
    title: "Cyclone",
    subtitle: "Category 3+",
    icon: Wind,
    iconBg: "#EDE9FE",
    iconColor: "#7C3AED",
    difficulty: "Hard",
    diffBg: "#FEE2E2",
    diffColor: "#DC2626",
    questions: 15,
    bestScore: "75%",
    primary: false,
  },
  {
    slug: "earthquake",
    title: "Earthquake",
    subtitle: "Seismic Response",
    icon: Zap,
    iconBg: "#FFEDD5",
    iconColor: "#EA580C",
    difficulty: "Med",
    diffBg: "#F3F4F6",
    diffColor: "#6B7280",
    questions: 10,
    bestScore: "--",
    primary: true,
  },
  {
    slug: "heatwave",
    title: "Heatwave",
    subtitle: "Extreme Temps",
    icon: Sun,
    iconBg: "#FEF9C3",
    iconColor: "#CA8A04",
    difficulty: "Easy",
    diffBg: "#D1FAE5",
    diffColor: "#047857",
    questions: 8,
    bestScore: "100%",
    primary: false,
  },
];

export default function QuizDashboardPage() {
  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Knowledge Assessment</h1>
          <p className="mt-1 text-sm text-[#6B7280]">Test your readiness for critical scenarios.</p>
        </div>
        <Link href="/user/quiz/history" className="shrink-0 text-xs font-semibold text-[#10B981]">
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
        <h2 className="text-lg font-bold text-[#111827]">Take a Test</h2>
        <div className="mt-3 space-y-3">
          {quizzes.map((q) => {
            const Icon = q.icon;
            return (
              <div key={q.slug} className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ backgroundColor: q.iconBg, color: q.iconColor }}>
                      <Icon size={18} />
                    </span>
                    <div>
                      <p className="text-base font-bold text-[#111827]">{q.title}</p>
                      <p className="text-xs text-[#6B7280]">{q.subtitle}</p>
                    </div>
                  </div>
                  <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ backgroundColor: q.diffBg, color: q.diffColor }}>
                    {q.difficulty}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[#F3F4F6] pt-4 text-sm">
                  <div>
                    <p className="text-xs text-[#6B7280]">Questions</p>
                    <p className="font-semibold text-[#111827]">{q.questions}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#6B7280]">Best Score</p>
                    <p className={q.bestScore === "--" ? "font-semibold text-[#9CA3AF]" : "font-semibold text-[#10B981]"}>{q.bestScore}</p>
                  </div>
                </div>

                <Link
                  href={`/user/quiz/${q.slug}`}
                  className={
                    q.primary
                      ? "mt-4 flex items-center justify-center gap-2 rounded-2xl bg-[#10B981] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0E9F72]"
                      : "mt-4 flex items-center justify-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
                  }
                >
                  Start →
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}