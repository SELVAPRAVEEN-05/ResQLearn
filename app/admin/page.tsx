"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Users,
  BookOpen,
  FileQuestion,
  Award,
  Layers,
  RotateCw,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Flame,
} from "lucide-react";
import Link from "next/link";

interface StudentPerf {
  id: number;
  name: string;
  email: string;
  status: string;
  preparednessScore: number;
  courseProgress: number;
  completedCourses: number;
  quizAttempts: number;
  averageScore: number;
  bestScore: number;
}

interface AdminStats {
  totalStudents: number;
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  publishedCourses: number;
  totalLessons: number;
  totalMaterials: number;
  totalCompletedCourses: number;
  courseCompletionPercentage: number;
  totalQuizAttempts: number;
  averageQuizScore: number;
  totalPassed: number;
  totalFailed: number;
  activeAlerts: number;
  studentPerformance: StudentPerf[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const [heatwaveData, setHeatwaveData] = useState<any>(null);
  const [heatwaveLoading, setHeatwaveLoading] = useState<boolean>(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Admin stats fetch error:", err);
        setLoading(false);
      });

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
        console.error("Admin heatwave fetch error:", err);
        setHeatwaveLoading(false);
      });

    fetch("/api/heatwave/analytics")
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res) setAnalytics(res);
        setAnalyticsLoading(false);
      })
      .catch((err) => {
        console.error("Admin heatwave analytics fetch error:", err);
        setAnalyticsLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center">
        <RotateCw className="animate-spin text-[#10B981] mb-3" size={32} />
        <p className="text-sm font-bold text-[#0F172A]">
          Loading live telemetry from Neon PostgreSQL...
        </p>
      </div>
    );
  }

  const s = stats || {
    totalStudents: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalCourses: 0,
    publishedCourses: 0,
    totalLessons: 0,
    totalMaterials: 0,
    totalCompletedCourses: 0,
    courseCompletionPercentage: 0,
    totalQuizAttempts: 0,
    averageQuizScore: 0,
    totalPassed: 0,
    totalFailed: 0,
    activeAlerts: 0,
    studentPerformance: [],
  };

  const summary = analytics?.summary || {};
  const yearly = analytics?.yearly_trends || [];
  const monthly = analytics?.monthly_distribution || [];

  const summaryCards = [
    {
      label: "Current Temperature",
      value:
        heatwaveData?.temperature != null
          ? `${heatwaveData.temperature}°C`
          : "N/A",
      tone: "text-[#0F172A]",
    },
    {
      label: "Current Risk",
      value: heatwaveData?.risk || "Low",
      tone: "text-[#059669]",
    },
    {
      label: "Heatwave Events",
      value:
        summary?.total_heatwave_days != null
          ? `${summary.total_heatwave_days}`
          : "N/A",
      tone: "text-[#DC2626]",
    },
    {
      label: "Average Temp",
      value:
        summary?.overall_avg_max_temp != null
          ? `${summary.overall_avg_max_temp}°C`
          : "N/A",
      tone: "text-[#0F172A]",
    },
    {
      label: "Peak Temp",
      value:
        summary?.all_time_peak_temp != null
          ? `${summary.all_time_peak_temp}°C`
          : "N/A",
      tone: "text-[#EA580C]",
    },
    {
      label: "Predicted Risk",
      value:
        heatwaveData?.prediction_source === "historical_model"
          ? "Historical Model"
          : heatwaveData?.risk || "Low",
      tone: "text-[#10B981]",
    },
  ];

  return (
    <div className="space-y-6 pb-12 animate-[fadeIn_0.4s_ease-out]">
      {/* Header section */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0F172A]">
              Platform Intelligence & Analytics
            </h1>
            <span className="rounded-full bg-[#10B981]/15 px-3 py-1 text-xs font-bold text-[#059669] border border-[#10B981]/20">
              Neon DB Live
            </span>
          </div>
          <p className="mt-1 text-sm text-[#64748B]">
            Real-time student progress, curriculum metrics, and disaster
            knowledge mastery.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-[#10B981] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#059669] active:scale-98 sm:min-h-0"
            href="/admin/heatwave"
          >
            <Flame size={15} /> Heatwave Predictor
          </Link>
          <Link
            className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[#CBD5E1] bg-white px-4 py-2.5 text-xs font-bold text-[#334155] shadow-2xs transition hover:bg-[#F8FAFC] sm:min-h-0"
            href="/admin/alerts"
          >
            <AlertTriangle className="text-[#EA580C]" size={15} /> Broadcast
            Alert
          </Link>
        </div>
      </div>

      {/* Admin Live Heatwave & Weather Telemetry Card */}
      <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-2xs space-y-3 relative overflow-hidden">
        <Flame
          className="pointer-events-none absolute -right-6 -top-6 text-[#EF4444]/5"
          size={140}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Live Weather Telemetry — Erode, Tamil Nadu
            </span>
          </div>

          {heatwaveLoading ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F1F5F9] px-3 py-1 text-xs font-bold text-[#64748B]">
              <RotateCw className="animate-spin text-[#10B981]" size={12} />{" "}
              Fetching Live Risk...
            </span>
          ) : heatwaveData && heatwaveData.available ? (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                (heatwaveData.risk || "").toUpperCase() === "HIGH"
                  ? "bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]"
                  : (heatwaveData.risk || "").toUpperCase() === "MODERATE"
                    ? "bg-[#FEF3C7] text-[#D97706] border border-[#FCD34D]"
                    : "bg-[#ECFDF5] text-[#059669] border border-[#6EE7B7]"
              }`}
            >
              <ShieldCheck size={14} /> {heatwaveData.risk || "Low"} Risk
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-bold text-[#059669]">
              <ShieldCheck size={14} /> Low Risk
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#0F172A]">
              Live Erode Temperature & Risk Level
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-[#64748B]">
              {heatwaveData?.available && heatwaveData?.temperature != null
                ? `Live temperature is ${heatwaveData.temperature}°C. ML Model prediction indicates ${heatwaveData.prediction?.toLowerCase() || "low heatwave risk"}.`
                : "Environmental sensors & weather APIs reporting stable conditions."}
            </p>
          </div>
          {heatwaveData?.temperature != null && (
            <span className="text-3xl font-black text-[#0F172A] sm:ml-4 sm:shrink-0">
              {heatwaveData.temperature}°C
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-[#F1F5F9] pt-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs font-semibold text-[#64748B]">
            XGBoost Model Status:{" "}
            <strong className="text-[#059669]">Active (Port 8000)</strong>
          </span>
          <Link
            className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-[#10B981] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#059669] sm:min-h-0"
            href="/admin/heatwave"
          >
            Open Admin Heatwave Predictor <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Heatwave Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-3xl bg-white p-5 shadow-2xs border border-[#E2E8F0] flex flex-col justify-between hover:border-[#CBD5E1] transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                {card.label}
              </span>
              <Flame className="text-[#EF4444]" size={15} />
            </div>
            <div className="mt-3">
              <span className={`text-2xl font-black ${card.tone}`}>
                {card.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {!analyticsLoading && analytics && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="min-w-0 rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-2xs">
            <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-sm font-black text-[#0F172A]">
                Historical Temperature Trend
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                {summary.date_range || "Historical"}
              </span>
            </div>
            <div className="h-56 w-full min-w-0 sm:h-64">
              <ResponsiveContainer height="100%" width="100%">
                <LineChart data={yearly.slice(-12)}>
                  <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 11, fill: "#64748B" }}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
                  <Tooltip />
                  <Line
                    dataKey="avg_max_temp"
                    dot={{ r: 3 }}
                    stroke="#10B981"
                    strokeWidth={2.5}
                    type="monotone"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="min-w-0 rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-2xs">
            <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-sm font-black text-[#0F172A]">
                Monthly Heatwave Pattern
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                Peak: {summary.peak_heatwave_month || "N/A"}
              </span>
            </div>
            <div className="h-56 w-full min-w-0 sm:h-64">
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={monthly.slice(0, 12)}>
                  <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month_name"
                    tick={{ fontSize: 11, fill: "#64748B" }}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
                  <Tooltip />
                  <Bar
                    dataKey="heatwave_days"
                    fill="#EF4444"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Primary KPI Grid (6 metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Students */}
        <div className="rounded-3xl bg-white p-5 shadow-2xs border border-[#E2E8F0] flex flex-col justify-between hover:border-[#CBD5E1] transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Students
            </span>
            <Users className="text-[#3B82F6]" size={16} />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-[#0F172A]">
              {s.totalStudents}
            </span>
            <p className="text-[11px] font-bold text-[#059669] mt-0.5">
              {s.activeUsers} Active
            </p>
          </div>
        </div>

        {/* Published Courses */}
        <div className="rounded-3xl bg-white p-5 shadow-2xs border border-[#E2E8F0] flex flex-col justify-between hover:border-[#CBD5E1] transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Courses
            </span>
            <BookOpen className="text-[#10B981]" size={16} />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-[#0F172A]">
              {s.publishedCourses}
            </span>
            <p className="text-[11px] font-bold text-[#64748B] mt-0.5">
              / {s.totalCourses} Total
            </p>
          </div>
        </div>

        {/* Lessons & Materials */}
        <div className="rounded-3xl bg-white p-5 shadow-2xs border border-[#E2E8F0] flex flex-col justify-between hover:border-[#CBD5E1] transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Lessons
            </span>
            <Layers className="text-[#8B5CF6]" size={16} />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-[#0F172A]">
              {s.totalLessons}
            </span>
            <p className="text-[11px] font-bold text-[#64748B] mt-0.5">
              {s.totalMaterials} Materials
            </p>
          </div>
        </div>

        {/* Completed Courses */}
        <div className="rounded-3xl bg-white p-5 shadow-2xs border border-[#E2E8F0] flex flex-col justify-between hover:border-[#CBD5E1] transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Completed
            </span>
            <Award className="text-[#F59E0B]" size={16} />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-[#059669]">
              {s.totalCompletedCourses}
            </span>
            <p className="text-[11px] font-bold text-[#64748B] mt-0.5">
              {s.courseCompletionPercentage}% Avg Progress
            </p>
          </div>
        </div>

        {/* Quiz Attempts */}
        <div className="rounded-3xl bg-white p-5 shadow-2xs border border-[#E2E8F0] flex flex-col justify-between hover:border-[#CBD5E1] transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Quiz Runs
            </span>
            <FileQuestion className="text-[#EC4899]" size={16} />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-[#0F172A]">
              {s.totalQuizAttempts}
            </span>
            <p className="text-[11px] font-bold text-[#059669] mt-0.5">
              {s.averageQuizScore}% Avg Score
            </p>
          </div>
        </div>

        {/* Pass / Fail Rate */}
        <div className="rounded-3xl bg-white p-5 shadow-2xs border border-[#E2E8F0] flex flex-col justify-between hover:border-[#CBD5E1] transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Pass / Fail
            </span>
            <TrendingUp className="text-[#10B981]" size={16} />
          </div>
          <div className="mt-3">
            <span className="text-lg font-black text-[#059669]">
              {s.totalPassed} Pass
            </span>
            <p className="text-[11px] font-bold text-[#DC2626] mt-0.5">
              {s.totalFailed} Failed
            </p>
          </div>
        </div>
      </div>

      {/* Student Performance Table */}
      <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-2xs space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">
              Student Performance & Preparedness Scores
            </h2>
            <p className="text-xs text-[#64748B]">
              Computed dynamically from Neon PostgreSQL course progress and quiz
              attempts
            </p>
          </div>
          <Link
            className="flex items-center gap-1 text-xs font-bold text-[#059669] hover:underline"
            href="/admin/users"
          >
            View All Users <ArrowRight size={13} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead>
              <tr className="border-b border-[#F1F5F9] text-[#64748B] font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3 pl-1">Student Name & Email</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Preparedness Score</th>
                <th className="pb-3">Courses Completed</th>
                <th className="pb-3">Avg Quiz Score</th>
                <th className="pb-3">Best Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] font-medium text-[#334155]">
              {s.studentPerformance.length === 0 ? (
                <tr>
                  <td
                    className="py-8 text-center text-xs text-[#94A3B8]"
                    colSpan={6}
                  >
                    No student activity records found in database yet.
                  </td>
                </tr>
              ) : (
                s.studentPerformance.map((stu) => (
                  <tr key={stu.id} className="hover:bg-[#F8FAFC] transition">
                    <td className="py-3.5 pl-1">
                      <div className="font-bold text-[#0F172A]">{stu.name}</div>
                      <div className="text-[11px] text-[#64748B]">
                        {stu.email}
                      </div>
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          stu.status === "Active"
                            ? "bg-[#DCFCE7] text-[#15803D]"
                            : "bg-[#F1F5F9] text-[#64748B]"
                        }`}
                      >
                        {stu.status}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className="font-black text-sm text-[#059669]">
                        {stu.preparednessScore} pts
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className="font-bold text-[#0F172A]">
                        {stu.completedCourses}
                      </span>{" "}
                      courses
                    </td>
                    <td className="py-3.5">
                      <span className="font-bold text-[#0F172A]">
                        {stu.averageScore}%
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className="rounded-lg bg-[#ECFDF5] px-2 py-1 text-xs font-bold text-[#059669]">
                        {stu.bestScore}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
