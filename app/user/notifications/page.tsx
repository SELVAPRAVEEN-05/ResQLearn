"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCheck, AlertTriangle, GraduationCap, Award, Settings } from "lucide-react";

const filters = ["All", "Alerts", "Learning", "System"];

const notifications = [
  {
    id: 1,
    title: "Flood Warning",
    time: "Just now",
    description: "High water levels detected in your area. Review your evacuation plan immediately.",
    icon: AlertTriangle,
    iconBg: "#DC2626",
    accent: "#DC2626",
    cardBg: "#FEF2F2",
    action: { label: "View Plan", style: "danger" },
  },
  {
    id: 2,
    title: "New Module Available",
    time: "2h ago",
    description: "Wildfire Prevention 101 is now live. Continue your preparedness training.",
    icon: GraduationCap,
    iconBg: "#10B981",
    accent: "#10B981",
    cardBg: "#FFFFFF",
    action: { label: "Start Module", style: "neutral" },
  },
  {
    id: 3,
    title: "Level Up!",
    time: "Yesterday",
    description: "You've earned the 'Flood Expert' badge for completing all required modules.",
    icon: Award,
    iconBg: "#E0E7FF",
    iconColor: "#4F46E5",
    accent: null,
    cardBg: "#FFFFFF",
    action: null,
  },
  {
    id: 4,
    title: "System Maintenance",
    time: "Oct 24",
    description: "The platform will be offline for 1 hour tonight starting at 2:00 AM UTC.",
    icon: Settings,
    iconBg: "#F3F4F6",
    iconColor: "#6B7280",
    accent: null,
    cardBg: "#FFFFFF",
    action: null,
  },
];

export default function NotificationsPage() {
  const router = useRouter();

  return (
    <section className="space-y-4">
      {/* Custom header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="rounded-full p-1 transition hover:bg-[#F3F4F6]" aria-label="Go back">
            <ArrowLeft size={18} className="text-[#10B981]" />
          </button>
          <h1 className="text-xl font-bold text-[#10B981]">Notifications</h1>
        </div>
        <button className="rounded-full p-2 transition hover:bg-[#F3F4F6]" aria-label="Mark all as read">
          <CheckCheck size={18} className="text-[#10B981]" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((filter, i) => (
          <button
            key={filter}
            className={
              i === 0
                ? "shrink-0 rounded-full bg-[#10B981] px-4 py-2 text-sm font-semibold text-white"
                : "shrink-0 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#6B7280]"
            }
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div className="space-y-3">
        {notifications.map((n) => {
          const Icon = n.icon;
          return (
            <div
              key={n.id}
              className="rounded-2xl border border-[#E5E7EB] p-4 shadow-sm"
              style={{
                backgroundColor: n.cardBg,
                borderLeft: n.accent ? `4px solid ${n.accent}` : undefined,
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: n.accent ? n.iconBg : n.iconBg,
                      color: n.accent ? "#FFFFFF" : n.iconColor,
                    }}
                  >
                    <Icon size={16} />
                  </span>
                  <div>
                    <p className="text-sm font-bold" style={{ color: n.accent ?? "#111827" }}>
                      {n.title}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[#374151]">{n.description}</p>
                  </div>
                </div>
                <span className="shrink-0 text-xs text-[#9CA3AF]">{n.time}</span>
              </div>

              {n.action && (
                <button
                  className={
                    n.action.style === "danger"
                      ? "mt-3 rounded-full bg-[#DC2626] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#B91C1C]"
                      : "mt-3 rounded-full bg-[#F3F4F6] px-4 py-2 text-xs font-semibold text-[#111827] transition hover:bg-[#E5E7EB]"
                  }
                >
                  {n.action.label}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}