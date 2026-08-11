"use client";

import Link from "next/link";
import { ArrowLeft, Droplet, Wind, Mountain, ChevronRight } from "lucide-react";

const filters = ["All", "Flood", "Cyclone", "Earthquake"];

const attempts = [
  { slug: "flood-preparedness", title: "Flood Preparedness", icon: Droplet, iconBg: "#F3F4F6", score: "9/10 · 90%", date: "Oct 24, 2023", result: "Passed" },
  { slug: "cyclone-basics", title: "Cyclone Basics", icon: Wind, iconBg: "#F3F4F6", score: "5/10 · 50%", date: "Oct 15, 2023", result: "Failed" },
  { slug: "earthquake-response", title: "Earthquake Response", icon: Mountain, iconBg: "#F3F4F6", score: "10/10 · 100%", date: "Sep 02, 2023", result: "Passed" },
];

export default function QuizHistoryPage() {
  return (
    <section className="space-y-4">
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
          <h1 className="text-2xl font-bold text-[#111827]">Quiz History</h1>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-[#E5E7EB] rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="text-center">
          <p className="text-xl font-bold text-[#10B981]">85%</p>
          <p className="mt-1 text-xs text-[#6B7280]">Avg. Score</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-[#111827]">12</p>
          <p className="mt-1 text-xs text-[#6B7280]">Attempts</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-[#10B981]">92%</p>
          <p className="mt-1 text-xs text-[#6B7280]">Pass Rate</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((f, i) => (
          <button
            key={f}
            className={
              i === 0
                ? "shrink-0 rounded-full bg-[#10B981] px-4 py-2 text-sm font-semibold text-white"
                : "shrink-0 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#6B7280]"
            }
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {attempts.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.slug}
              href={`/user/quiz/history/${a.slug}`}
              className="flex w-full items-center justify-between gap-3 rounded-3xl border border-[#E5E7EB] bg-white p-4 text-left shadow-sm transition hover:bg-[#F9FAFB]"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: a.iconBg }}>
                  <Icon size={18} className="text-[#111827]" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#111827]">{a.title}</p>
                  <p className="mt-0.5 text-xs text-[#6B7280]">{a.score} · {a.date}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={{
                    backgroundColor: a.result === "Passed" ? "#D1FAE5" : "#FEE2E2",
                    color: a.result === "Passed" ? "#047857" : "#DC2626",
                  }}
                >
                  {a.result}
                </span>
                <ChevronRight size={16} className="text-[#9CA3AF]" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}