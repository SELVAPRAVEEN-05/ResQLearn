"use client";

import { useState } from "react";
import { BarChart2, Users, Search, User, Target } from "lucide-react";

export default function QuizReportsPage() {
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  return (
    <div className="space-y-6 pb-6 animate-[fadeIn_0.5s_ease-out]">
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-[#111827]">Quiz Reports</h1>
        <p className="text-sm text-[#6B7280]">Overall, disaster-wise, and user analytics</p>
      </div>

      {/* Overall Performance */}
      <div className="rounded-2xl bg-white p-5 shadow-[0_2px_10px_-4px_rgba(17,24,39,0.05)]">
        <h2 className="mb-4 text-sm font-bold text-[#111827] flex items-center gap-2">
          <BarChart2 size={16} className="text-[#10B981]" />
          Overall Performance
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-[#F3F4F6] bg-[#F9FAFB] p-3 text-center">
            <span className="text-xl font-bold text-[#111827]">4,820</span>
            <p className="mt-1 text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">Attempts</p>
          </div>
          <div className="rounded-xl border border-[#F3F4F6] bg-[#F9FAFB] p-3 text-center">
            <span className="text-xl font-bold text-[#111827]">74%</span>
            <p className="mt-1 text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">Avg Score</p>
          </div>
          <div className="rounded-xl border border-[#F3F4F6] bg-[#F9FAFB] p-3 text-center">
            <span className="text-xl font-bold text-[#10B981]">82%</span>
            <p className="mt-1 text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">Pass Rate</p>
          </div>
        </div>
      </div>

      {/* Disaster-wise Analytics */}
      <div className="rounded-2xl bg-white p-5 shadow-[0_2px_10px_-4px_rgba(17,24,39,0.05)]">
        <h2 className="mb-5 text-sm font-bold text-[#111827] flex items-center gap-2">
          <Target size={16} className="text-[#10B981]" />
          Disaster-wise Averages
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#374151]">Flood</span>
            <span className="text-sm font-bold text-[#111827]">78%</span>
          </div>
          <div className="flex items-center justify-between border-t border-[#F3F4F6] pt-4">
            <span className="text-sm font-medium text-[#374151]">Fire</span>
            <span className="text-sm font-bold text-[#111827]">84%</span>
          </div>
          <div className="flex items-center justify-between border-t border-[#F3F4F6] pt-4">
            <span className="text-sm font-medium text-[#374151]">Cyclone</span>
            <span className="text-sm font-bold text-[#111827]">71%</span>
          </div>
          <div className="flex items-center justify-between border-t border-[#F3F4F6] pt-4">
            <span className="text-sm font-medium text-[#374151]">Earthquake</span>
            <span className="text-sm font-bold text-[#111827]">68%</span>
          </div>
        </div>
      </div>

      {/* User-wise Report */}
      <div className="rounded-2xl bg-white p-5 shadow-[0_2px_10px_-4px_rgba(17,24,39,0.05)]">
        <h2 className="mb-4 text-sm font-bold text-[#111827] flex items-center gap-2">
          <Users size={16} className="text-[#10B981]" />
          User-wise Report
        </h2>
        
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={16} />
          <select 
            className="w-full appearance-none rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] py-2.5 pl-10 pr-4 text-sm text-[#111827] focus:border-[#10B981] focus:outline-none focus:ring-1 focus:ring-[#10B981]"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            <option value="" disabled>Search or select a user...</option>
            <option value="8493">Sarah Jenkins (ID: 8493)</option>
            <option value="9102">Michael Chen (ID: 9102)</option>
          </select>
        </div>

        {selectedUserId === "8493" ? (
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#10B981] text-white">
                <User size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#111827]">Sarah Jenkins</p>
                <p className="text-xs text-[#6B7280]">User ID: {selectedUserId}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-[#374151]">Flood</span>
                <span className="font-bold text-[#10B981]">8/10</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#E5E7EB]">
                <div className="h-1.5 rounded-full bg-[#10B981]" style={{ width: "80%" }}></div>
              </div>

              <div className="flex justify-between items-center text-sm pt-2">
                <span className="font-medium text-[#374151]">Fire</span>
                <span className="font-bold text-[#10B981]">9/10</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#E5E7EB]">
                <div className="h-1.5 rounded-full bg-[#10B981]" style={{ width: "90%" }}></div>
              </div>

              <div className="flex justify-between items-center text-sm pt-2">
                <span className="font-medium text-[#374151]">Cyclone</span>
                <span className="font-bold text-[#F59E0B]">7/10</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#E5E7EB]">
                <div className="h-1.5 rounded-full bg-[#F59E0B]" style={{ width: "70%" }}></div>
              </div>

              <div className="flex justify-between items-center text-sm pt-2">
                <span className="font-medium text-[#374151]">Earthquake</span>
                <span className="font-bold text-[#EF4444]">6/10</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#E5E7EB]">
                <div className="h-1.5 rounded-full bg-[#EF4444]" style={{ width: "60%" }}></div>
              </div>
            </div>
          </div>
        ) : selectedUserId === "9102" ? (
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
             <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3B82F6] text-white">
                <User size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#111827]">Michael Chen</p>
                <p className="text-xs text-[#6B7280]">User ID: {selectedUserId}</p>
              </div>
            </div>
            <p className="text-sm text-[#6B7280] italic">No quiz data available for this user.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[#D1D5DB] py-8 text-center">
            <p className="text-sm text-[#9CA3AF]">Select a user to view their detailed performance report.</p>
          </div>
        )}
      </div>
    </div>
  );
}
