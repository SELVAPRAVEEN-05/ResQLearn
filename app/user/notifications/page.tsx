"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCheck, AlertTriangle, Info, ShieldAlert, CheckCircle2, RotateCw } from "lucide-react";

interface AlertItem {
  id: string;
  numericId: number;
  title: string;
  message: string;
  severity: string;
  date: string;
  read: boolean;
}

const filters = ["All", "Unread", "High", "Medium", "Low"];

const getIcon = (severity: string) => {
  switch (severity) {
    case "High": return AlertTriangle;
    case "Medium": return ShieldAlert;
    default: return Info;
  }
};

const getColors = (severity: string) => {
  switch (severity) {
    case "High": return { iconBg: "#DC2626", accent: "#DC2626", cardBg: "#FEF2F2" };
    case "Medium": return { iconBg: "#F59E0B", accent: "#F59E0B", cardBg: "#FFFBEB" };
    default: return { iconBg: "#3B82F6", accent: "#3B82F6", cardBg: "#EFF6FF" };
  }
};

export default function NotificationsPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("All");

  const loadAlerts = async () => {
    try {
      const res = await fetch("/api/alerts");
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
      }
    } catch (e) {
      console.error("Error loading alerts:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const markAlertRead = async (id: string | number) => {
    try {
      await fetch(`/api/alerts/${id}/read`, { method: "POST" });
      setAlerts((prev) =>
        prev.map((a) => (String(a.id) === String(id) || String(a.numericId) === String(id) ? { ...a, read: true } : a))
      );
    } catch (e) {
      console.error("Error marking alert read:", e);
    }
  };

  const markAllRead = () => {
    alerts.forEach((a) => {
      if (!a.read) markAlertRead(a.id);
    });
  };

  const filteredAlerts = alerts.filter((a) => {
    if (selectedFilter === "All") return true;
    if (selectedFilter === "Unread") return !a.read;
    return a.severity === selectedFilter;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <RotateCw size={28} className="animate-spin text-[#10B981] mb-2" />
        <p className="text-sm font-semibold text-[#111827]">Loading notifications...</p>
      </div>
    );
  }

  return (
    <section className="space-y-4 animate-[fadeIn_0.5s_ease-out] pb-10">
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="rounded-full p-1 transition hover:bg-[#F3F4F6]"
            aria-label="Go back"
          >
            <ArrowLeft size={18} className="text-[#10B981]" />
          </button>
          <h1 className="text-xl font-bold text-[#10B981]">Notifications</h1>
        </div>
        <button
          onClick={markAllRead}
          className="rounded-full p-2 transition hover:bg-[#F3F4F6]"
          aria-label="Mark all as read"
          title="Mark all as read"
        >
          <CheckCheck size={18} className="text-[#10B981]" />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={
              selectedFilter === filter
                ? "shrink-0 rounded-full bg-[#10B981] px-4 py-2 text-xs font-bold text-white"
                : "shrink-0 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-xs font-semibold text-[#6B7280] hover:text-[#111827]"
            }
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#D1D5DB] p-8 text-center bg-white mt-4">
            <CheckCircle2 size={32} className="mx-auto text-[#9CA3AF] mb-3" />
            <h3 className="text-sm font-bold text-[#111827]">You're all caught up!</h3>
            <p className="text-xs text-[#6B7280] mt-1">No active notifications under this filter.</p>
          </div>
        ) : (
          filteredAlerts.map((n) => {
            const Icon = getIcon(n.severity);
            const colors = getColors(n.severity);
            const dateStr = new Date(n.date).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            });

            return (
              <div
                key={n.id}
                onClick={() => markAlertRead(n.id)}
                className={`rounded-2xl border border-[#E5E7EB] p-4 shadow-sm cursor-pointer transition ${
                  !n.read ? "ring-2 ring-offset-1 ring-[#10B981]/50" : ""
                }`}
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
                      <p className="mt-1 text-xs leading-5 text-[#374151]">{n.message}</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-[11px] text-[#9CA3AF]">{dateStr}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}