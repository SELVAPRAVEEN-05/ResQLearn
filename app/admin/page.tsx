"use client";

import { 
  Users, 
  BookOpen, 
  FileQuestion, 
  Bot,
  TrendingUp,
  Activity,
  Award,
  Target
} from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 pb-6 animate-[fadeIn_0.5s_ease-out]">
      {/* Header section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10B981] opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-[#10B981]"></span>
            </span>
            <span className="font-bold text-[#111827]">SafeGraph AI Admin</span>
          </div>
        </div>
        
        <div>
          <h1 className="text-2xl font-extrabold text-[#111827]">System Overview</h1>
          <p className="mt-1 text-sm text-[#6B7280]">Key metrics and platform analytics</p>
        </div>
      </div>

      {/* Top Stats Grid (2x2) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col justify-between rounded-2xl bg-white p-4 shadow-[0_2px_10px_-4px_rgba(17,24,39,0.05)]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-[#6B7280]">Total Users</span>
            <Users size={16} className="text-[#9CA3AF]" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-[#111827]">1,250</span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl bg-white p-4 shadow-[0_2px_10px_-4px_rgba(17,24,39,0.05)]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-[#6B7280]">Total Courses</span>
            <BookOpen size={16} className="text-[#9CA3AF]" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-[#111827]">18</span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl bg-white p-4 shadow-[0_2px_10px_-4px_rgba(17,24,39,0.05)]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-[#6B7280]">Total Quizzes</span>
            <FileQuestion size={16} className="text-[#9CA3AF]" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-[#111827]">45</span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl bg-white p-4 shadow-[0_2px_10px_-4px_rgba(17,24,39,0.05)]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-[#6B7280]">AI Queries</span>
            <Bot size={16} className="text-[#9CA3AF]" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-[#111827]">3,240</span>
          </div>
        </div>
      </div>

      {/* User Activity */}
      <div className="rounded-2xl bg-white p-5 shadow-[0_2px_10px_-4px_rgba(17,24,39,0.05)]">
        <h2 className="mb-4 text-sm font-bold text-[#111827] flex items-center gap-2">
          <Activity size={16} className="text-[#10B981]" />
          User Activity
        </h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-[#F3F4F6] pb-3">
            <span className="text-sm font-medium text-[#6B7280]">New users</span>
            <span className="text-sm font-bold text-[#111827]">+142 this week</span>
          </div>
          <div className="flex justify-between items-center border-b border-[#F3F4F6] pb-3">
            <span className="text-sm font-medium text-[#6B7280]">Active users</span>
            <span className="text-sm font-bold text-[#111827]">890 daily</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-[#6B7280]">User growth</span>
            <span className="text-sm font-bold text-[#10B981]">+12.5% MoM</span>
          </div>
        </div>
      </div>

      {/* Course Statistics */}
      <div className="rounded-2xl bg-white p-5 shadow-[0_2px_10px_-4px_rgba(17,24,39,0.05)]">
        <h2 className="mb-4 text-sm font-bold text-[#111827] flex items-center gap-2">
          <BookOpen size={16} className="text-[#10B981]" />
          Course Statistics
        </h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-[#F3F4F6] pb-3">
            <span className="text-sm font-medium text-[#6B7280]">Most viewed course</span>
            <span className="text-sm font-bold text-[#111827]">Flood Safety Basics</span>
          </div>
          <div className="flex justify-between items-center border-b border-[#F3F4F6] pb-3">
            <span className="text-sm font-medium text-[#6B7280]">Least viewed course</span>
            <span className="text-sm font-bold text-[#111827]">Drought Preparedness</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-[#6B7280]">Course completion</span>
            <span className="text-sm font-bold text-[#10B981]">68%</span>
          </div>
        </div>
      </div>

      {/* Quiz Analytics */}
      <div className="rounded-2xl bg-white p-5 shadow-[0_2px_10px_-4px_rgba(17,24,39,0.05)]">
        <h2 className="mb-4 text-sm font-bold text-[#111827] flex items-center gap-2">
          <Target size={16} className="text-[#10B981]" />
          Quiz Analytics
        </h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-[#F3F4F6] pb-3">
            <span className="text-sm font-medium text-[#6B7280]">Total attempts</span>
            <span className="text-sm font-bold text-[#111827]">4,820</span>
          </div>
          <div className="flex justify-between items-center border-b border-[#F3F4F6] pb-3">
            <span className="text-sm font-medium text-[#6B7280]">Average score</span>
            <span className="text-sm font-bold text-[#111827]">74%</span>
          </div>
          <div className="flex justify-between items-center border-b border-[#F3F4F6] pb-3">
            <span className="text-sm font-medium text-[#6B7280]">Most difficult</span>
            <span className="text-sm font-bold text-[#EF4444]">Earthquake</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-[#6B7280]">Best-performing</span>
            <span className="text-sm font-bold text-[#10B981]">Flood</span>
          </div>
        </div>
      </div>

      {/* Disaster-wise Performance */}
      <div className="rounded-2xl bg-white p-5 shadow-[0_2px_10px_-4px_rgba(17,24,39,0.05)]">
        <h2 className="mb-5 text-sm font-bold text-[#111827] flex items-center gap-2">
          <Award size={16} className="text-[#10B981]" />
          Disaster-wise Performance
        </h2>

        <div className="space-y-4">
          <div>
            <div className="mb-1 flex justify-between text-xs font-semibold text-[#111827]">
              <span>Flood</span>
              <span>82%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
              <div className="h-full rounded-full bg-[#10B981]" style={{ width: "82%" }}></div>
            </div>
          </div>
          
          <div>
            <div className="mb-1 flex justify-between text-xs font-semibold text-[#111827]">
              <span>Fire</span>
              <span>74%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
              <div className="h-full rounded-full bg-[#10B981]" style={{ width: "74%" }}></div>
            </div>
          </div>
          
          <div>
            <div className="mb-1 flex justify-between text-xs font-semibold text-[#111827]">
              <span>Cyclone</span>
              <span>69%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
              <div className="h-full rounded-full bg-[#10B981]" style={{ width: "69%" }}></div>
            </div>
          </div>

          <div>
            <div className="mb-1 flex justify-between text-xs font-semibold text-[#111827]">
              <span>Earthquake</span>
              <span>63%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
              <div className="h-full rounded-full bg-[#10B981]" style={{ width: "63%" }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
