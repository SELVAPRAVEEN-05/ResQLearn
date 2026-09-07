"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  BookOpen, 
  FileQuestion, 
  Bot,
  Activity,
  Target,
  CheckCircle2,
  XCircle,
  Award,
  Layers,
  FileText,
  RotateCw,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  ArrowRight
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
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center">
        <RotateCw size={32} className="animate-spin text-[#10B981] mb-3" />
        <p className="text-sm font-bold text-[#0F172A]">Loading live telemetry from Neon PostgreSQL...</p>
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

  return (
    <div className="space-y-6 pb-12 animate-[fadeIn_0.4s_ease-out]">
      {/* Header section */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0F172A]">Platform Intelligence & Analytics</h1>
            <span className="rounded-full bg-[#10B981]/15 px-3 py-1 text-xs font-bold text-[#059669] border border-[#10B981]/20">
              Neon DB Live
            </span>
          </div>
          <p className="mt-1 text-sm text-[#64748B]">Real-time student progress, curriculum metrics, and disaster knowledge mastery.</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/content"
            className="flex items-center gap-1.5 rounded-xl bg-[#10B981] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#059669] shadow-sm transition active:scale-98"
          >
            <BookOpen size={15} /> Manage Courses
          </Link>
          <Link
            href="/admin/alerts"
            className="flex items-center gap-1.5 rounded-xl border border-[#CBD5E1] bg-white px-4 py-2.5 text-xs font-bold text-[#334155] hover:bg-[#F8FAFC] shadow-2xs transition"
          >
            <AlertTriangle size={15} className="text-[#EA580C]" /> Broadcast Alert
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid (6 metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Students */}
        <div className="rounded-3xl bg-white p-5 shadow-2xs border border-[#E2E8F0] flex flex-col justify-between hover:border-[#CBD5E1] transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Students</span>
            <Users size={16} className="text-[#3B82F6]" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-[#0F172A]">{s.totalStudents}</span>
            <p className="text-[11px] font-bold text-[#059669] mt-0.5">{s.activeUsers} Active</p>
          </div>
        </div>

        {/* Published Courses */}
        <div className="rounded-3xl bg-white p-5 shadow-2xs border border-[#E2E8F0] flex flex-col justify-between hover:border-[#CBD5E1] transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Courses</span>
            <BookOpen size={16} className="text-[#10B981]" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-[#0F172A]">{s.publishedCourses}</span>
            <p className="text-[11px] font-bold text-[#64748B] mt-0.5">/ {s.totalCourses} Total</p>
          </div>
        </div>

        {/* Lessons & Materials */}
        <div className="rounded-3xl bg-white p-5 shadow-2xs border border-[#E2E8F0] flex flex-col justify-between hover:border-[#CBD5E1] transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Lessons</span>
            <Layers size={16} className="text-[#8B5CF6]" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-[#0F172A]">{s.totalLessons}</span>
            <p className="text-[11px] font-bold text-[#64748B] mt-0.5">{s.totalMaterials} Materials</p>
          </div>
        </div>

        {/* Completed Courses */}
        <div className="rounded-3xl bg-white p-5 shadow-2xs border border-[#E2E8F0] flex flex-col justify-between hover:border-[#CBD5E1] transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Completed</span>
            <Award size={16} className="text-[#F59E0B]" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-[#059669]">{s.totalCompletedCourses}</span>
            <p className="text-[11px] font-bold text-[#64748B] mt-0.5">{s.courseCompletionPercentage}% Avg Progress</p>
          </div>
        </div>

        {/* Quiz Attempts */}
        <div className="rounded-3xl bg-white p-5 shadow-2xs border border-[#E2E8F0] flex flex-col justify-between hover:border-[#CBD5E1] transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Quiz Runs</span>
            <FileQuestion size={16} className="text-[#EC4899]" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-[#0F172A]">{s.totalQuizAttempts}</span>
            <p className="text-[11px] font-bold text-[#059669] mt-0.5">{s.averageQuizScore}% Avg Score</p>
          </div>
        </div>

        {/* Pass / Fail Rate */}
        <div className="rounded-3xl bg-white p-5 shadow-2xs border border-[#E2E8F0] flex flex-col justify-between hover:border-[#CBD5E1] transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Pass / Fail</span>
            <TrendingUp size={16} className="text-[#10B981]" />
          </div>
          <div className="mt-3">
            <span className="text-lg font-black text-[#059669]">{s.totalPassed} Pass</span>
            <p className="text-[11px] font-bold text-[#DC2626] mt-0.5">{s.totalFailed} Failed</p>
          </div>
        </div>
      </div>

      {/* Student Performance Table */}
      <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">Student Performance & Preparedness Scores</h2>
            <p className="text-xs text-[#64748B]">Computed dynamically from Neon PostgreSQL course progress and quiz attempts</p>
          </div>
          <Link
            href="/admin/users"
            className="flex items-center gap-1 text-xs font-bold text-[#059669] hover:underline"
          >
            View All Users <ArrowRight size={13} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
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
                  <td colSpan={6} className="py-8 text-center text-xs text-[#94A3B8]">
                    No student activity records found in database yet.
                  </td>
                </tr>
              ) : (
                s.studentPerformance.map((stu) => (
                  <tr key={stu.id} className="hover:bg-[#F8FAFC] transition">
                    <td className="py-3.5 pl-1">
                      <div className="font-bold text-[#0F172A]">{stu.name}</div>
                      <div className="text-[11px] text-[#64748B]">{stu.email}</div>
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
                      <span className="font-black text-sm text-[#059669]">{stu.preparednessScore} pts</span>
                    </td>
                    <td className="py-3.5">
                      <span className="font-bold text-[#0F172A]">{stu.completedCourses}</span> courses
                    </td>
                    <td className="py-3.5">
                      <span className="font-bold text-[#0F172A]">{stu.averageScore}%</span>
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
