"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BarChart2,
  Target,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  TrendingUp,
  Award,
  Users,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
  BookOpen
} from "lucide-react";

type ReportItem = {
  id: number;
  score: number;
  total: number;
  passed: boolean;
  created_at: string;
  user_name: string;
  user_email: string;
  institution: string;
  quiz_title: string;
  category: string;
};

export default function QuizReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [summary, setSummary] = useState({
    totalAttempts: 0,
    passRate: "100%",
    topCategory: "Earthquake Safety",
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PASSED" | "FAILED">("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/admin/quiz-reports")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setReports(data.reports || []);
          if (data.summary) setSummary(data.summary);
        }
      })
      .catch((err) => console.error("Error loading reports:", err))
      .finally(() => setLoading(false));
  }, []);

  const totalScores = reports.reduce((acc, r) => acc + (r.score / (r.total || 1)), 0);
  const avgScore = reports.length > 0 ? Math.round((totalScores / reports.length) * 100) : 0;
  const passedCount = reports.filter((r) => r.passed).length;
  const failedCount = reports.length - passedCount;

  // Extract unique categories for filter
  const uniqueCategories = useMemo(() => {
    const cats = new Set<string>();
    reports.forEach((r) => {
      if (r.category) cats.add(r.category);
    });
    return Array.from(cats);
  }, [reports]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        (r.user_name && r.user_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.user_email && r.user_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.quiz_title && r.quiz_title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.institution && r.institution.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "PASSED" && r.passed) ||
        (statusFilter === "FAILED" && !r.passed);

      const matchesCategory =
        categoryFilter === "ALL" || r.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [reports, searchQuery, statusFilter, categoryFilter]);

  return (
    <div className="space-y-6 pb-12 animate-[fadeIn_0.3s_ease-out]">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] p-6 lg:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 h-64 w-64 rounded-full bg-[#10B981]/15 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold backdrop-blur-md mb-3 border border-white/10">
              <Sparkles size={13} className="text-emerald-400" />
              <span>Institutional Assessment Analytics</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white">
              Quiz & Learning Reports
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-xl">
              Real-time student comprehension metrics, passing thresholds, and detailed attempt audit logs.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-4 py-3 text-right">
              <span className="text-xs text-slate-400 font-medium block">Total Assessments</span>
              <span className="text-2xl font-black text-white">{summary.totalAttempts || reports.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Total Attempts</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#0F172A]">{summary.totalAttempts || reports.length}</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <TrendingUp size={12} className="mr-0.5" /> Active
            </span>
          </div>
          <p className="mt-1 text-[11px] text-[#94A3B8]">Recorded submissions</p>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Average Score</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Award size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#0F172A]">{avgScore}%</span>
            <span className="text-xs font-semibold text-slate-500">overall</span>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${avgScore}%` }} />
          </div>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Pass Rate</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#10B981]">{summary.passRate}</span>
            <span className="text-xs font-bold text-[#10B981] bg-emerald-50 px-2 py-0.5 rounded-md">
              {passedCount} passed
            </span>
          </div>
          <p className="mt-1 text-[11px] text-[#94A3B8]">{failedCount} retake attempts</p>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Top Category</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Layers size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-base sm:text-lg font-black text-[#0F172A] line-clamp-1">
              {summary.topCategory}
            </span>
            <p className="mt-1 text-[11px] text-[#94A3B8]">Most frequent topic</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="rounded-3xl border border-[#E2E8F0] bg-white shadow-sm overflow-hidden">
        {/* Table/Filter Toolbar */}
        <div className="border-b border-[#E2E8F0] p-5 lg:p-6 bg-[#F8FAFC]/50 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#0F172A] flex items-center gap-2">
                <Target size={18} className="text-[#10B981]" />
                Student Assessment Attempts Log
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Showing {filteredReports.length} of {reports.length} total attempt records
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="relative sm:col-span-6 lg:col-span-6">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student name, email, quiz or institution..."
                className="w-full rounded-xl border border-[#CBD5E1] bg-white pl-10 pr-4 py-2 text-xs font-medium text-[#0F172A] placeholder-[#94A3B8] focus:border-[#10B981] focus:outline-hidden focus:ring-2 focus:ring-[#10B981]/20 transition"
              />
            </div>

            {/* Status Filter */}
            <div className="sm:col-span-3 lg:col-span-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full rounded-xl border border-[#CBD5E1] bg-white px-3 py-2 text-xs font-semibold text-[#334155] focus:border-[#10B981] focus:outline-hidden focus:ring-2 focus:ring-[#10B981]/20 transition"
              >
                <option value="ALL">All Statuses</option>
                <option value="PASSED">Passed Only</option>
                <option value="FAILED">Retake / Failed Only</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="sm:col-span-3 lg:col-span-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-xl border border-[#CBD5E1] bg-white px-3 py-2 text-xs font-semibold text-[#334155] focus:border-[#10B981] focus:outline-hidden focus:ring-2 focus:ring-[#10B981]/20 transition"
              >
                <option value="ALL">All Categories</option>
                {uniqueCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Body */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#10B981] border-t-transparent mb-3" />
            <span className="text-xs font-semibold text-[#64748B]">Loading assessment history from database...</span>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F1F5F9] text-[#94A3B8] mb-3">
              <BookOpen size={24} />
            </div>
            <h3 className="text-sm font-bold text-[#0F172A]">No assessment logs found</h3>
            <p className="mt-1 text-xs text-[#64748B] max-w-sm">
              {searchQuery || statusFilter !== "ALL" || categoryFilter !== "ALL"
                ? "No records match your selected filters. Try clearing the search query or status filter."
                : "No quiz attempts recorded in the database yet. When students complete learning modules, their results will appear here."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#F1F5F9]">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    <th className="py-3 px-6">Student</th>
                    <th className="py-3 px-6">Quiz / Module</th>
                    <th className="py-3 px-6">Category</th>
                    <th className="py-3 px-6">Score</th>
                    <th className="py-3 px-6">Outcome</th>
                    <th className="py-3 px-6 text-right">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-xs">
                  {filteredReports.map((item) => {
                    const pct = Math.round((item.score / (item.total || 1)) * 100);
                    return (
                      <tr key={item.id} className="hover:bg-[#F8FAFC] transition">
                        <td className="py-3.5 px-6">
                          <div className="font-bold text-[#0F172A]">{item.user_name || "Anonymous Student"}</div>
                          <div className="text-[11px] text-[#64748B] font-medium flex items-center gap-1.5">
                            <span>{item.user_email || "No email"}</span>
                            {item.institution && (
                              <>
                                <span>•</span>
                                <span className="text-[#059669] font-semibold">{item.institution}</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-6 font-semibold text-[#1E293B]">
                          {item.quiz_title}
                        </td>
                        <td className="py-3.5 px-6">
                          <span className="inline-flex items-center rounded-lg bg-[#F1F5F9] px-2.5 py-1 text-[11px] font-bold text-[#475569]">
                            {item.category || "General"}
                          </span>
                        </td>
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#0F172A] text-sm">
                              {item.score}/{item.total}
                            </span>
                            <span className="text-[11px] font-semibold text-[#64748B]">({pct}%)</span>
                          </div>
                          <div className="mt-1 w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full ${item.passed ? "bg-emerald-500" : "bg-red-500"}`}
                              style={{ width: `${Math.min(100, Math.max(5, pct))}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3.5 px-6">
                          {item.passed ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-bold text-[#065F46] border border-[#A7F3D0]">
                              <CheckCircle2 size={13} className="text-[#10B981]" /> Passed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEF2F2] px-3 py-1 text-xs font-bold text-[#991B1B] border border-[#FECACA]">
                              <XCircle size={13} className="text-[#EF4444]" /> Retake
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-6 text-right text-[11px] text-[#64748B] font-medium">
                          {item.created_at ? new Date(item.created_at).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }) : "Recent"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="block md:hidden p-4 space-y-3">
              {filteredReports.map((item) => {
                const pct = Math.round((item.score / (item.total || 1)) * 100);
                return (
                  <div key={item.id} className="rounded-2xl border border-[#E2E8F0] p-4 bg-white shadow-xs space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-black text-sm text-[#0F172A]">{item.user_name}</span>
                        <p className="text-xs text-[#64748B]">{item.user_email}</p>
                        {item.institution && (
                          <span className="inline-block mt-0.5 text-[10px] font-bold text-[#059669]">
                            {item.institution}
                          </span>
                        )}
                      </div>
                      {item.passed ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFDF5] px-2.5 py-0.5 text-[11px] font-bold text-[#065F46] border border-[#A7F3D0]">
                          <CheckCircle2 size={12} className="text-[#10B981]" /> Passed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF2F2] px-2.5 py-0.5 text-[11px] font-bold text-[#991B1B] border border-[#FECACA]">
                          <XCircle size={12} className="text-[#EF4444]" /> Retake
                        </span>
                      )}
                    </div>

                    <div className="rounded-xl bg-[#F8FAFC] p-3 text-xs space-y-1">
                      <div className="font-semibold text-[#1E293B]">{item.quiz_title}</div>
                      <div className="flex items-center justify-between text-[#64748B] text-[11px]">
                        <span>Topic: <b className="text-[#334155]">{item.category}</b></span>
                        <span className="font-bold text-[#0F172A] text-xs">{item.score}/{item.total} ({pct}%)</span>
                      </div>
                    </div>

                    {item.created_at && (
                      <div className="text-[10px] text-[#94A3B8] font-medium text-right flex items-center justify-end gap-1">
                        <Calendar size={11} />
                        {new Date(item.created_at).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

