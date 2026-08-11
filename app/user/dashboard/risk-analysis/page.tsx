import { AlertTriangle, ArrowLeft, Droplet, Flame, Waves, Factory, ChevronRight } from "lucide-react";
import Link from "next/link";

const riskBreakdown = [
  {
    title: "Flood",
    icon: Droplet,
    probability: "65% Prob.",
    accent: "#F97316",
    pillBg: "#FEF3C7",
    pillText: "#B45309",
    description: "Moderate risk due to impending weather system. Areas near the river are highly susceptible.",
  },
  {
    title: "Wildfire",
    icon: Flame,
    probability: "15% Prob.",
    accent: "#10B981",
    pillBg: "#D1FAE5",
    pillText: "#047857",
    description: "Low risk. Recent rainfall has mitigated dry conditions in surrounding forests.",
  },
  {
    title: "Earthquake",
    icon: AlertTriangle,
    probability: "5% Prob.",
    accent: "#10B981",
    pillBg: "#D1FAE5",
    pillText: "#047857",
    description: "Baseline tectonic activity. No immediate anomalous readings detected.",
  },
];

const infrastructure = [
  {
    title: "Chemical Plant Delta",
    subtitle: "2.4 miles West",
    icon: Factory,
    iconBg: "#FEE2E2",
    iconColor: "#DC2626",
  },
  {
    title: "City Reservoir Dam",
    subtitle: "5.1 miles North · Currently at safe capacity",
    icon: Waves,
    iconBg: "#F3F4F6",
    iconColor: "#6B7280",
  },
];

export default function RiskAnalysisPage() {
  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Link
          href="/user/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#111827] transition hover:text-[#10B981]"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#FEE2E2] text-[#DC2626]">
            <AlertTriangle size={24} />
          </span>
          <h1 className="mt-4 text-xl font-bold text-[#111827]">Local Risk Analysis</h1>
          <p className="mt-2 text-sm leading-6 text-[#6B7280]">
            Current risk assessment for your registered location.
          </p>
        </div>
      </div>

      {/* Overall status */}
      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
            Overall Status
          </p>
          <span className="rounded-full bg-[#FEF3C7] px-3 py-1 text-xs font-semibold text-[#B45309]">
            Elevated Risk
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between text-sm">
          <span className="font-medium text-[#111827]">Threat Level</span>
          <span className="font-semibold text-[#EA580C]">Moderate</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-[#F3F4F6]">
          <div className="h-2 rounded-full bg-[#EA580C]" style={{ width: "55%" }} />
        </div>

        <p className="mt-4 text-sm leading-6 text-[#6B7280]">
          Active flood warnings in low-lying coastal areas due to expected storm surge.
        </p>
      </div>

      {/* Risk breakdown */}
      <div>
        <h2 className="text-lg font-bold text-[#111827]">Risk Breakdown</h2>
        <div className="mt-3 space-y-3">
          {riskBreakdown.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm"
                style={{ borderLeft: `4px solid ${item.accent}` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon size={16} style={{ color: item.accent }} />
                    <p className="text-sm font-semibold text-[#111827]">{item.title}</p>
                  </div>
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold"
                    style={{ backgroundColor: item.pillBg, color: item.pillText }}
                  >
                    {item.probability}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[#6B7280]">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Nearby infrastructure risks */}
      <div>
        <h2 className="text-lg font-bold text-[#111827]">Nearby Infrastructure Risks</h2>
        <div className="mt-3 divide-y divide-[#E5E7EB] rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
          {infrastructure.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.title}
                className="flex w-full items-center justify-between gap-3 p-4 text-left transition hover:bg-[#F9FAFB]"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: item.iconBg, color: item.iconColor }}
                  >
                    <Icon size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">{item.title}</p>
                    <p className="mt-0.5 text-xs text-[#6B7280]">{item.subtitle}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="shrink-0 text-[#9CA3AF]" />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}