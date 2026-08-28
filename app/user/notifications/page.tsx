"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCheck, AlertTriangle, Info, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useMockData } from "@/contexts/MockDataContext";
import { useState } from "react";

const filters = ["All", "Unread", "High", "Medium", "Low"];

const getIcon = (severity: string) => {
  switch (severity) {
    case 'High': return AlertTriangle;
    case 'Medium': return ShieldAlert;
    default: return Info;
  }
};

const getColors = (severity: string) => {
  switch (severity) {
    case 'High': return { iconBg: "#DC2626", accent: "#DC2626", cardBg: "#FEF2F2" };
    case 'Medium': return { iconBg: "#F59E0B", accent: "#F59E0B", cardBg: "#FFFBEB" };
    default: return { iconBg: "#3B82F6", accent: "#3B82F6", cardBg: "#EFF6FF" };
  }
};

export default function NotificationsPage() {
  const router = useRouter();
  const { alerts, markAlertRead } = useMockData();
  const [selectedFilter, setSelectedFilter] = useState("All");

  const filteredAlerts = alerts.filter(a => {
    if (selectedFilter === "All") return true;
    if (selectedFilter === "Unread") return !a.read;
    return a.severity === selectedFilter;
  });

  const markAllRead = () => {
    alerts.forEach(a => {
      if (!a.read) markAlertRead(a.id);
    });
  };

  return (
    <section className="space-y-4 animate-[fadeIn_0.5s_ease-out]">
      {/* Custom header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="rounded-full p-1 transition hover:bg-[#F3F4F6]" aria-label="Go back">
            <ArrowLeft size={18} className="text-[#10B981]" />
          </button>
          <h1 className="text-xl font-bold text-[#10B981]">Notifications</h1>
        </div>
        <button 
          onClick={markAllRead}
          className="rounded-full p-2 transition hover:bg-[#F3F4F6]" 
          aria-label="Mark all as read"
        >
          <CheckCheck size={18} className="text-[#10B981]" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={
              selectedFilter === filter
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
        {filteredAlerts.length === 0 ? (
           <div className="rounded-3xl border border-dashed border-[#D1D5DB] p-8 text-center bg-white mt-4">
             <CheckCircle2 size={32} className="mx-auto text-[#9CA3AF] mb-3" />
             <h3 className="text-sm font-bold text-[#111827]">You're all caught up!</h3>
             <p className="text-xs text-[#6B7280] mt-1">No new notifications to show right now.</p>
           </div>
        ) : (
          filteredAlerts.map((n) => {
            const Icon = getIcon(n.severity);
            const colors = getColors(n.severity);
            const dateStr = new Date(n.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

            return (
              <div
                key={n.id}
                onClick={() => markAlertRead(n.id)}
                className={`rounded-2xl border border-[#E5E7EB] p-4 shadow-sm cursor-pointer transition ${!n.read ? 'ring-2 ring-offset-1 ring-[#10B981]/50' : ''}`}
                style={{
                  backgroundColor: !n.read ? colors.cardBg : "#FFFFFF",
                  borderLeft: `4px solid ${colors.accent}`,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: colors.iconBg,
                        color: "#FFFFFF",
                      }}
                    >
                      <Icon size={16} />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold" style={{ color: colors.accent }}>
                          {n.title}
                        </p>
                        {!n.read && <span className="h-2 w-2 rounded-full bg-[#10B981]"></span>}
                      </div>
                      <p className="mt-1 text-sm leading-6 text-[#374151]">{n.message}</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-[#9CA3AF]">{dateStr}</span>
                </div>

                {n.severity === 'High' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); alert("Opening emergency protocols..."); }}
                    className="mt-3 rounded-full bg-[#DC2626] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#B91C1C]"
                  >
                    View Plan
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}