"use client";

import { Bot, User, Mic, Send, Droplet, AlertTriangle, Briefcase, CheckCircle2 } from "lucide-react";

const suggestions = [
  { label: "How to prepare for a flood?", icon: Droplet },
  { label: "Explain earthquake safety", icon: AlertTriangle },
  { label: "Emergency kit list", icon: Briefcase },
];

export default function AssistantPage() {
  return (
    <section className="flex flex-col">
      <div className="space-y-5 pb-4">
        {/* Bot intro */}
        <div className="flex items-start gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#10B981] text-white">
            <Bot size={16} />
          </span>
          <div>
            <div className="rounded-2xl rounded-tl-sm border border-[#E5E7EB] bg-white px-4 py-3 text-sm leading-6 text-[#111827] shadow-sm">
              I'm your Disaster Assistant. How can I help you prepare today?
            </div>
            <span className="mt-1.5 flex items-center gap-1 text-xs text-[#10B981]">
              <CheckCircle2 size={12} /> Verified by Knowledge Graph
            </span>
          </div>
        </div>

        {/* Suggestions */}
        <div className="space-y-2 pl-10">
          {suggestions.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.label}
                className="flex w-full items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-left text-sm font-medium text-[#111827] shadow-sm transition hover:bg-[#F9FAFB]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[#6366F1]">
                  <Icon size={15} />
                </span>
                {s.label}
              </button>
            );
          })}
        </div>

        {/* User message */}
        <div className="flex items-start justify-end gap-2">
          <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-[#F3F4F6] px-4 py-3 text-sm leading-6 text-[#111827]">
            Can you give me the emergency kit list?
          </div>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E0E7FF] text-[#4F46E5]">
            <User size={16} />
          </span>
        </div>

        {/* Bot response */}
        <div className="flex items-start gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#10B981] text-white">
            <Bot size={16} />
          </span>
          <div>
            <div className="rounded-2xl rounded-tl-sm border-l-4 border-[#10B981] bg-white px-4 py-3 text-sm leading-6 text-[#111827] shadow-sm">
              <p className="font-medium">A basic emergency supply kit could include the following recommended items:</p>
              <ul className="mt-2 list-disc space-y-1.5 pl-4 text-[#374151]">
                <li>Water (one gallon per person per day for several days)</li>
                <li>Food (at least a three-day supply of non-perishable food)</li>
                <li>Battery-powered or hand crank radio and a NOAA Weather Radio</li>
                <li>Flashlight and extra batteries</li>
                <li>First aid kit</li>
              </ul>
            </div>
            <span className="mt-1.5 flex items-center gap-1 text-xs text-[#10B981]">
              <CheckCircle2 size={12} /> Verified by Knowledge Graph
            </span>
          </div>
        </div>
      </div>

      {/* Input bar — fixed above bottom nav */}
      <div className="fixed inset-x-0 bottom-16 z-10 bg-[#F9FAFB] px-4 pb-2 pt-2">
        <div className="mx-auto max-w-md">
          <div className="flex items-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-3 py-2 shadow-sm">
            <Mic size={18} className="shrink-0 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Ask your disaster preparedness question"
              className="w-full bg-transparent text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none"
            />
            <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#10B981] text-white transition hover:bg-[#0E9F72]">
              <Send size={15} />
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] leading-tight text-[#9CA3AF]">
            SafeGraph AI can make mistakes. Consider verifying critical emergency information.
          </p>
        </div>
      </div>

      {/* Spacer so messages aren't hidden behind the fixed input bar */}
      <div className="h-28" />
    </section>
  );
}