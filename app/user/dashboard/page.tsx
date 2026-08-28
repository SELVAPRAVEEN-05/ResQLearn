"use client";

import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  Phone,
  ShieldCheck,
  Bot,
  Bookmark,
  ArrowRight as ArrowRightIcon,
  Info
} from "lucide-react";
import Link from "next/link";
import { useMockData } from "@/contexts/MockDataContext";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { profile, courses, quizAttempts, alerts } = useMockData();
  const router = useRouter();

  const completedCoursesCount = courses.filter(c => c.progress === 100).length;
  const totalQuizScore = quizAttempts.reduce((acc, a) => acc + (a.score / a.total), 0);
  const avgQuizScore = quizAttempts.length > 0 ? Math.round((totalQuizScore / quizAttempts.length) * 100) : 0;

  const inProgressCourse = courses.find(c => c.progress > 0 && c.progress < 100) || courses[0];
  const activeAlert = alerts.find(a => !a.read && a.severity === 'High') || alerts[0];

  const stats = [
    { title: "Courses Completed", value: completedCoursesCount.toString(), icon: BookOpen },
    { title: "Avg Quiz Score", value: `${avgQuizScore}%`, icon: BarChart3 },
  ];

  return (
    <section className="space-y-4 animate-[fadeIn_0.5s_ease-out]">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-[#111827]">Hello, {profile.name.split(' ')[0]}.</h1>
        <p className="text-sm text-[#6B7280]">You're safe today.</p>
      </div>

      {/* Local risk level */}
      <div className="relative overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <ShieldCheck
          size={140}
          className="pointer-events-none absolute -right-6 -top-6 text-[#10B981]/5"
        />
        <div className="relative flex items-start justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
            Current Status
          </p>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#10B981]/10 px-3 py-1 text-xs font-semibold text-[#10B981]">
            <ShieldCheck size={12} /> Low Risk
          </span>
        </div>
        <p className="relative mt-2 text-lg font-semibold text-[#111827]">Local Risk Level</p>
        <p className="relative mt-3 text-sm leading-6 text-[#6B7280]">
          All local environmental and civic sensors report nominal conditions. Weather patterns are
          stable.
        </p>
        <Link 
          href="/user/dashboard/risk-analysis"
          className="relative mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#F3F4F6] px-4 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#E5E7EB]"
        >
          View Details <ArrowRight size={16} />
        </Link>
      </div>

      {/* Emergency call */}
      <div className="rounded-3xl bg-[#FEE2E2] p-5 shadow-sm border border-[#FCA5A5]/50">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FCA5A5] text-[#B91C1C]">
            <Phone size={18} />
          </span>
          <div>
            <p className="text-sm font-semibold text-[#B91C1C]">Emergency Services</p>
            <p className="mt-1 text-sm leading-5 text-[#991B1B]">
              Immediate assistance for life-threatening situations.
            </p>
          </div>
        </div>
        <button 
          onClick={() => alert("Mock: Dialing Emergency Services...")}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#DC2626] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#B91C1C]"
        >
          Call Now
        </button>
      </div>

      {/* Active alert */}
      {activeAlert && (
        <div className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            {activeAlert.severity === 'High' ? (
              <AlertTriangle size={14} className="text-[#DC2626]" />
            ) : (
              <Info size={14} className="text-[#F59E0B]" />
            )}
            <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${activeAlert.severity === 'High' ? 'text-[#DC2626]' : 'text-[#F59E0B]'}`}>
              {activeAlert.severity === 'High' ? 'Active Alert' : 'Advisory'}
            </p>
          </div>
          <p className="mt-2 text-lg font-semibold text-[#111827]">{activeAlert.title}</p>
          <p className="mt-2 text-sm leading-6 text-[#6B7280]">
            {activeAlert.message}
          </p>
          {activeAlert.severity === 'High' && (
            <div className="mt-4 flex gap-1.5">
              <span className="h-1.5 w-6 rounded-full bg-[#DC2626]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#FCA5A5]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#FCA5A5]" />
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="rounded-3xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
              <Icon size={18} className="text-[#111827]" />
              <p className="mt-3 text-2xl font-bold text-[#111827]">{item.value}</p>
              <p className="mt-1 text-xs text-[#6B7280]">{item.title}</p>
            </div>
          );
        })}
      </div>

      {/* Course Progress */}
      {inProgressCourse && (
        <div className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-xs font-semibold text-[#6B7280]">
              {inProgressCourse.progress === 100 ? 'Completed' : 'In Progress'}
            </span>
            <Bookmark size={18} className="text-[#6B7280]" />
          </div>
          <p className="mt-3 text-lg font-semibold text-[#111827]">{inProgressCourse.title}</p>
          <p className="mt-1 text-sm leading-6 text-[#6B7280] line-clamp-2">
            {inProgressCourse.description}
          </p>

          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="font-medium text-[#6B7280]">Progress</span>
            <span className="font-semibold text-[#10B981]">{inProgressCourse.progress}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-[#F3F4F6]">
            <div className="h-2 rounded-full bg-[#10B981]" style={{ width: `${inProgressCourse.progress}%` }} />
          </div>

          <Link
            href={`/user/learn/${inProgressCourse.slug}`}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#10B981] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0E9F72]"
          >
            ▶ {inProgressCourse.progress > 0 ? "Continue Module" : "Start Module"}
          </Link>
        </div>
      )}

      {/* Ask Agentic AI */}
      <button 
        onClick={() => router.push("/user/assistant")}
        className="flex w-full items-center justify-between rounded-3xl bg-[#111827] p-5 text-left transition hover:bg-[#1F2937] shadow-sm"
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#10B981]/20 text-[#10B981]">
            <Bot size={18} />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">Ask Agentic AI</p>
            <p className="text-xs text-[#9CA3AF]">Get instant emergency advice.</p>
          </div>
        </div>
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white">
          <ArrowRightIcon size={16} />
        </span>
      </button>
    </section>
  );
}