import Link from "next/link";
import { ListChecks, CheckCircle2, XCircle, Timer, Award, Download, Eye, RotateCcw } from "lucide-react";

const stats = [
  { label: "Total Questions", value: "10", icon: ListChecks, iconColor: "#6B7280" },
  { label: "Correct", value: "9", icon: CheckCircle2, iconColor: "#10B981" },
  { label: "Incorrect", value: "1", icon: XCircle, iconColor: "#DC2626" },
  { label: "Time Taken", value: "5m 20s", icon: Timer, iconColor: "#6B7280" },
];

export default function QuizResultPage({ params }: { params: { slug: string } }) {
  const scorePercent = 90;
  const circumference = 2 * Math.PI * 54;
  const dash = (scorePercent / 100) * circumference;

  return (
    <section className="space-y-5">
      <div className="text-center">
        <h1 className="text-xl font-bold text-[#111827]">Quiz Result</h1>
        <p className="mt-1 text-sm text-[#6B7280]">Flood Preparedness Module</p>
      </div>

      <div className="rounded-3xl border border-[#E5E7EB] bg-gradient-to-b from-white to-[#ECFDF5] p-8 shadow-sm">
        <div className="mx-auto flex h-40 w-40 items-center justify-center">
          <svg viewBox="0 0 120 120" className="h-40 w-40 -rotate-90">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#F3F4F6" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="#10B981"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <p className="text-3xl font-bold text-[#111827]">{scorePercent}%</p>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B7280]">Excellent</p>
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

      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D1FAE5] text-[#10B981]">
            <Award size={20} />
          </span>
          <div>
            <p className="text-sm font-bold text-[#111827]">Flood Safety Certified!</p>
            <p className="mt-1 text-sm leading-6 text-[#6B7280]">You've successfully completed the module.</p>
          </div>
        </div>
        <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#F3F4F6] px-4 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#E5E7EB]">
          <Download size={16} /> Download Certificate
        </button>
      </div>

      <div className="space-y-3">
        <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB]">
          <Eye size={16} /> Review Answers
        </button>
        <Link
          href={`/user/quiz/${params.slug}`}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
        >
          <RotateCcw size={16} /> Retry Quiz
        </Link>
        <Link
          href="/user/dashboard"
          className="flex w-full items-center justify-center rounded-2xl bg-[#10B981] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0E9F72]"
        >
          Back to Dashboard
        </Link>
      </div>
    </section>
  );
}