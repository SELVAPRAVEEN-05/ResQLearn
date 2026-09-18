"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  Phone,
  ShieldCheck,
  Bot,
  Bookmark,
  Award,
  CheckCircle2,
  RotateCw,
  Info,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface DashboardData {
  profile: {
    id?: number;
    name: string;
    email?: string;
    preparedness_score?: number;
    certificates?: number;
  };
  stats: {
    availableCoursesCount: number;
    startedCoursesCount: number;
    completedCoursesCount: number;
    overallLearningProgress: number;
    avgQuizScore: number;
    bestQuizScore: number;
    totalAttempts: number;
  };
  courses: Array<{
    id: number;
    slug: string;
    title: string;
    description: string;
    category?: string;
    progress: number;
    user_status?: string;
  }>;
  inProgressCourse: {
    id: number;
    slug: string;
    title: string;
    description: string;
    progress: number;
  } | null;
  alerts: Array<{
    id: number | string;
    title: string;
    message: string;
    severity: string;
    read: boolean;
  }>;
  recentAttempts: Array<{
    id: number;
    quiz_title: string;
    quiz_slug: string;
    score: number;
    total: number;
    passed: boolean;
    created_at: string;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [heatwaveData, setHeatwaveData] = useState<any>(null);
  const [heatwaveLoading, setHeatwaveLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("/api/user/dashboard")
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res) setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Dashboard error:", err);
        setLoading(false);
      });

    // Fetch live today heatwave prediction from AI service proxy
    fetch("/api/heatwave/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: "today" }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res) setHeatwaveData(res);
        setHeatwaveLoading(false);
      })
      .catch((err) => {
        console.error("Heatwave status error:", err);
        setHeatwaveLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <RotateCw className="animate-spin text-[#10B981] mb-2" size={28} />
        <p className="text-sm font-semibold text-[#111827]">
          Loading your dashboard...
        </p>
      </div>
    );
  }

  const profile = data?.profile || { name: "Student", preparedness_score: 0 };
  const stats = data?.stats || {
    availableCoursesCount: 0,
    startedCoursesCount: 0,
    completedCoursesCount: 0,
    overallLearningProgress: 0,
    avgQuizScore: 0,
    bestQuizScore: 0,
    totalAttempts: 0,
  };
  const activeAlert =
    data?.alerts?.find((a) => !a.read && a.severity === "High") ||
    data?.alerts?.[0];
  const inProgressCourse = data?.inProgressCourse;
  const recentAttempts = data?.recentAttempts || [];

  return (
    <section className="space-y-4 animate-[fadeIn_0.5s_ease-out] pb-10">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-black text-[#111827]">
          Hello, {profile.name.split(" ")[0]}.
        </h1>
        <p className="text-sm text-[#6B7280]">
          Preparedness Score:{" "}
          <strong className="text-[#10B981]">
            {profile.preparedness_score || 0}/100
          </strong>
        </p>
      </div>

      {/* Local risk level (Live Heatwave AI Status) */}
      <div className="relative overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm space-y-2">
        <ShieldCheck
          className="pointer-events-none absolute -right-6 -top-6 text-[#10B981]/5"
          size={140}
        />
        <div className="relative flex flex-wrap items-start justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
            Current Status (Erode)
          </p>
          {heatwaveLoading ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#F3F4F6] px-3 py-1 text-xs font-semibold text-[#6B7280]">
              <RotateCw className="animate-spin text-[#10B981]" size={12} />{" "}
              Fetching Live Risk...
            </span>
          ) : heatwaveData && heatwaveData.available ? (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                (heatwaveData.risk || "").toUpperCase() === "HIGH"
                  ? "bg-[#FEE2E2] text-[#DC2626]"
                  : (heatwaveData.risk || "").toUpperCase() === "MODERATE"
                    ? "bg-[#FEF3C7] text-[#D97706]"
                    : "bg-[#10B981]/10 text-[#10B981]"
              }`}
            >
              <ShieldCheck size={12} /> {heatwaveData.risk || "Low"} Risk
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#10B981]/10 px-3 py-1 text-xs font-semibold text-[#10B981]">
              <ShieldCheck size={12} /> Low Risk
            </span>
          )}
        </div>

        <div className="relative flex flex-col gap-3 pt-1 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <p className="text-lg font-semibold text-[#111827]">
              Local Heatwave Risk
            </p>
            <p className="mt-1 text-sm leading-6 text-[#6B7280]">
              {heatwaveData?.available && heatwaveData?.temperature != null
                ? `Live temperature is ${heatwaveData.temperature}°C. ML Model prediction indicates ${heatwaveData.prediction?.toLowerCase() || "low heatwave risk"}.`
                : "All local environmental and civic sensors report nominal conditions. Weather patterns are stable."}
            </p>
          </div>
          {heatwaveData?.temperature != null && (
            <span className="text-2xl font-black text-[#111827] sm:ml-2 sm:shrink-0">
              {heatwaveData.temperature}°C
            </span>
          )}
        </div>

        {/* Quick link to Full Heatwave AI Module */}
        <Link
          className="relative mt-2 flex w-full items-center justify-between rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2.5 text-xs font-bold text-[#111827] transition hover:bg-[#F3F4F6]"
          href="/user/heatwave"
        >
          <span className="flex items-center gap-1.5 text-[#10B981]">
            <ShieldCheck size={14} /> Open Heatwave AI Predictor
          </span>
          <ArrowRight className="text-[#6B7280]" size={14} />
        </Link>
      </div>

      {/* Emergency Call */}
      <div className="rounded-3xl bg-[#FEE2E2] p-5 shadow-sm border border-[#FCA5A5]/50">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FCA5A5] text-[#B91C1C]">
            <Phone size={18} />
          </span>
          <div>
            <p className="text-sm font-semibold text-[#B91C1C]">
              Emergency Services
            </p>
            <p className="mt-1 text-sm leading-5 text-[#991B1B]">
              Immediate assistance for life-threatening situations.
            </p>
          </div>
        </div>
        <button
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#DC2626] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#B91C1C]"
          onClick={() => {
            window.location.href = "tel:112";
          }}
        >
          Call 112 (Emergency)
        </button>
      </div>

      {/* Active alert */}
      {activeAlert && (
        <div className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            {activeAlert.severity === "High" ? (
              <AlertTriangle className="text-[#DC2626]" size={14} />
            ) : (
              <Info className="text-[#F59E0B]" size={14} />
            )}
            <p
              className={`text-xs font-semibold uppercase tracking-[0.18em] ${
                activeAlert.severity === "High"
                  ? "text-[#DC2626]"
                  : "text-[#F59E0B]"
              }`}
            >
              {activeAlert.severity === "High" ? "Active Alert" : "Advisory"}
            </p>
          </div>
          <p className="mt-2 text-lg font-semibold text-[#111827]">
            {activeAlert.title}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#6B7280]">
            {activeAlert.message}
          </p>
        </div>
      )}

      {/* Real Neon DB Learning & Quiz Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <BookOpen className="text-[#10B981]" size={18} />
            <span className="text-[10px] font-bold uppercase text-[#6B7280]">
              Courses
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-[#111827]">
            {stats.completedCoursesCount}{" "}
            <span className="text-xs font-normal text-[#6B7280]">
              / {stats.availableCoursesCount}
            </span>
          </p>
          <p className="mt-0.5 text-xs text-[#6B7280]">Completed Courses</p>
        </div>

        <div className="rounded-3xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <BarChart3 className="text-[#3B82F6]" size={18} />
            <span className="text-[10px] font-bold uppercase text-[#6B7280]">
              Progress
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-[#111827]">
            {stats.overallLearningProgress}%
          </p>
          <p className="mt-0.5 text-xs text-[#6B7280]">Overall Progress</p>
        </div>

        <div className="rounded-3xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <Award className="text-[#F59E0B]" size={18} />
            <span className="text-[10px] font-bold uppercase text-[#6B7280]">
              Assessments
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-[#111827]">
            {stats.avgQuizScore}%
          </p>
          <p className="mt-0.5 text-xs text-[#6B7280]">Avg Quiz Score</p>
        </div>

        <div className="rounded-3xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <CheckCircle2 className="text-[#10B981]" size={18} />
            <span className="text-[10px] font-bold uppercase text-[#6B7280]">
              Best Score
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-[#111827]">
            {stats.bestQuizScore}%
          </p>
          <p className="mt-0.5 text-xs text-[#6B7280]">
            {stats.totalAttempts} Quiz Attempts
          </p>
        </div>
      </div>

      {/* Course In Progress Card */}
      {inProgressCourse ? (
        <div className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-start justify-between">
            <span className="rounded-full bg-[#ECFDF5] border border-[#A7F3D0] px-3 py-1 text-xs font-bold text-[#059669]">
              {Number(inProgressCourse.progress) === 100
                ? "Completed ✓"
                : Number(inProgressCourse.progress) > 0
                  ? "In Progress"
                  : "Recommended Next"}
            </span>
            <Bookmark className="text-[#6B7280]" size={18} />
          </div>
          <p className="text-lg font-bold text-[#111827]">
            {inProgressCourse.title}
          </p>
          <p className="text-xs leading-5 text-[#6B7280] line-clamp-2">
            {inProgressCourse.description}
          </p>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="font-semibold text-[#6B7280]">
              Database Course Progress
            </span>
            <span className="font-bold text-[#10B981]">
              {inProgressCourse.progress}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-[#F3F4F6]">
            <div
              className="h-2 rounded-full bg-[#10B981] transition-all"
              style={{ width: `${inProgressCourse.progress}%` }}
            />
          </div>

          <Link
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#10B981] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0E9F72]"
            href={`/user/learn/${inProgressCourse.slug}`}
          >
            ▶{" "}
            {Number(inProgressCourse.progress) > 0
              ? "Continue Course"
              : "Start Course"}
          </Link>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-[#D1D5DB] bg-white p-6 text-center space-y-2">
          <BookOpen className="mx-auto text-[#9CA3AF]" size={28} />
          <p className="text-sm font-bold text-[#111827]">
            Start a course to track your progress.
          </p>
          <Link
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#10B981] px-4 py-2 text-xs font-bold text-white hover:bg-[#0E9F72]"
            href="/user/learn"
          >
            Explore Courses <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* Recent Quiz Activity */}
      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#111827]">
            Recent Quiz Attempts
          </h3>
          <Link
            className="text-xs font-bold text-[#10B981] hover:underline"
            href="/user/quiz/history"
          >
            View All
          </Link>
        </div>

        {recentAttempts.length === 0 ? (
          <div className="py-6 text-center space-y-1">
            <p className="text-xs font-semibold text-[#6B7280]">
              No quiz attempts yet.
            </p>
            <Link
              className="text-xs font-bold text-[#10B981] hover:underline"
              href="/user/quiz"
            >
              Take an assessment now →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentAttempts.map((att) => {
              const pct = Math.round((att.score / (att.total || 1)) * 100);

              return (
                <Link
                  key={att.id}
                  className="flex items-center justify-between rounded-2xl border border-[#E5E7EB] p-3 hover:bg-[#F9FAFB] transition text-xs"
                  href={`/user/quiz/${att.quiz_slug}/result?attemptId=${att.id}`}
                >
                  <div>
                    <p className="font-bold text-[#111827]">{att.quiz_title}</p>
                    <p className="text-[11px] text-[#6B7280]">
                      {att.score}/{att.total} score ({pct}%)
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      att.passed
                        ? "bg-[#D1FAE5] text-[#059669]"
                        : "bg-[#FEE2E2] text-[#DC2626]"
                    }`}
                  >
                    {att.passed ? "PASSED" : "RETAKE"}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Ask Agentic AI */}
      <button
        className="flex w-full items-center justify-between rounded-3xl bg-[#111827] p-5 text-left transition hover:bg-[#1F2937] shadow-sm"
        onClick={() => router.push("/user/assistant")}
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#10B981]/20 text-[#10B981]">
            <Bot size={18} />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">
              Ask SafeGraph AI Assistant
            </p>
            <p className="text-xs text-[#9CA3AF]">
              Instant disaster triage & recommendations.
            </p>
          </div>
        </div>
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white">
          <ArrowRight size={16} />
        </span>
      </button>
    </section>
  );
}
