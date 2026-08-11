import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  Phone,
  ShieldCheck,
  Bot,
  Bookmark,
  ArrowRight as ArrowRightIcon,
} from "lucide-react";
import Link from "next/link";

const stats = [
  { title: "Courses Completed", value: "3", icon: BookOpen },
  { title: "Avg Quiz Score", value: "85%", icon: BarChart3 },
];

export default function DashboardPage() {
  return (
    <section className="space-y-4">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-[#111827]">Hello, Sarah.</h1>
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
        <Link href="/user/dashboard/risk-analysis" className="relative mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#F3F4F6] px-4 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#E5E7EB]">
          View Details <ArrowRight size={16} />
        </Link>
      </div>

      {/* Emergency call */}
      <div className="rounded-3xl bg-[#FEE2E2] p-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FCA5A5] text-[#B91C1C]">
            *
          </span>
          <div>
            <p className="text-sm font-semibold text-[#B91C1C]">Emergency Call</p>
            <p className="mt-1 text-sm leading-5 text-[#991B1B]">
              Immediate assistance for life-threatening situations.
            </p>
          </div>
        </div>
        <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#DC2626] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#B91C1C]">
          <Phone size={16} /> Call Now
        </button>
      </div>

      {/* Active alert */}
      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} className="text-[#DC2626]" />
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#DC2626]">
            Active Alert
          </p>
        </div>
        <p className="mt-2 text-lg font-semibold text-[#111827]">Heatwave Warning</p>
        <p className="mt-2 text-sm leading-6 text-[#6B7280]">
          Northern Region. Temperatures expected to exceed 105°F. Stay hydrated.
        </p>
        <div className="mt-4 flex gap-1.5">
          <span className="h-1.5 w-6 rounded-full bg-[#DC2626]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#FCA5A5]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#FCA5A5]" />
        </div>
      </div>

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

      {/* Flood preparedness */}
      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-xs font-semibold text-[#6B7280]">
            In Progress
          </span>
          <Bookmark size={18} className="text-[#6B7280]" />
        </div>
        <p className="mt-3 text-lg font-semibold text-[#111827]">Flood Preparedness</p>
        <p className="mt-1 text-sm leading-6 text-[#6B7280]">
          Module 2: Securing your home and assembling an emergency kit.
        </p>

        <div className="mt-4 flex items-center justify-between text-xs">
          <span className="font-medium text-[#6B7280]">Progress</span>
          <span className="font-semibold text-[#10B981]">60%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-[#F3F4F6]">
          <div className="h-2 rounded-full bg-[#10B981]" style={{ width: "60%" }} />
        </div>

        <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#10B981] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0E9F72]">
          ▶ Continue Module
        </button>
      </div>

      {/* Ask Agentic AI */}
      <button className="flex w-full items-center justify-between rounded-3xl bg-[#111827] p-5 text-left transition hover:bg-[#1F2937]">
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