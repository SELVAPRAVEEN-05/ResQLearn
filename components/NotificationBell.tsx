"use client";

import { useEffect, useState, useRef } from "react";
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  Info,
  ShieldAlert,
  CheckCircle2,
  X,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface AlertItem {
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
    case "High":
    case "Critical":
      return AlertTriangle;
    case "Medium":
    case "Moderate":
      return ShieldAlert;
    default:
      return Info;
  }
};

const getColors = (severity: string) => {
  switch (severity) {
    case "High":
    case "Critical":
      return {
        iconBg: "#DC2626",
        accent: "#DC2626",
        cardBg: "#FEF2F2",
        border: "#FCA5A5",
      };
    case "Medium":
    case "Moderate":
      return {
        iconBg: "#F59E0B",
        accent: "#D97706",
        cardBg: "#FFFBEB",
        border: "#FCD34D",
      };
    default:
      return {
        iconBg: "#3B82F6",
        accent: "#2563EB",
        cardBg: "#EFF6FF",
        border: "#BFDBFE",
      };
  }
};

export default function NotificationBell({
  role = "student",
}: {
  role?: "student" | "admin";
}) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const popoverRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const unreadCount = alerts.filter((a) => !a.read).length;

  const loadAlerts = async () => {
    try {
      const res = await fetch("/api/alerts");

      if (res.ok) {
        const data = await res.json();

        setAlerts(data.alerts || []);
      }
    } catch (e) {
      console.error("Error loading notification alerts:", e);
    }
  };

  useEffect(() => {
    loadAlerts();
    // Poll every 30s for updates
    const interval = setInterval(loadAlerts, 30000);

    return () => clearInterval(interval);
  }, [pathname]);

  // Handle click outside to close popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const markAlertRead = async (id: string | number) => {
    try {
      await fetch(`/api/alerts/${id}/read`, { method: "POST" });
      setAlerts((prev) =>
        prev.map((a) =>
          String(a.id) === String(id) || String(a.numericId) === String(id)
            ? { ...a, read: true }
            : a,
        ),
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

    return a.severity.toLowerCase() === selectedFilter.toLowerCase();
  });

  return (
    <div ref={popoverRef} className="relative">
      {/* Bell Button */}
      <button
        aria-label="Toggle notifications"
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#374151] transition hover:bg-[#F3F4F6] focus:outline-none"
        title="Notifications"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="text-[#111827]" size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#DC2626] text-[10px] font-black text-white ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Popover */}
      {isOpen && (
        <div className="fixed left-2 right-2 top-16 z-50 w-auto overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white shadow-2xl animate-[fadeIn_0.15s_ease-out] sm:absolute sm:left-auto sm:right-0 sm:top-11 sm:w-80 md:w-96">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#F3F4F6] px-4 py-3.5 bg-white">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#111827]">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-[#DC2626]/10 px-2 py-0.5 text-[10px] font-extrabold text-[#DC2626]">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  className="flex min-h-10 items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-[#10B981] transition hover:bg-[#ECFDF5]"
                  title="Mark all as read"
                  onClick={markAllRead}
                >
                  <CheckCheck size={14} /> Mark read
                </button>
              )}
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full p-1 text-[#9CA3AF] transition hover:bg-[#F3F4F6] hover:text-[#111827]"
                onClick={() => setIsOpen(false)}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto px-4 py-2 border-b border-[#F3F4F6] bg-[#FAFAFA] no-scrollbar">
            {filters.map((filter) => (
              <button
                key={filter}
                className={
                  selectedFilter === filter
                    ? "shrink-0 rounded-full bg-[#10B981] px-3 py-1 text-[11px] font-bold text-white shadow-xs"
                    : "shrink-0 rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-[11px] font-semibold text-[#6B7280] hover:text-[#111827]"
                }
                onClick={() => setSelectedFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Alert List Container */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#F3F4F6] p-2 space-y-1">
            {filteredAlerts.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="mx-auto text-[#9CA3AF]" size={28} />
                <p className="text-xs font-bold text-[#111827]">
                  You&apos;re all caught up!
                </p>
                <p className="text-[11px] text-[#6B7280]">
                  No notifications for this filter.
                </p>
              </div>
            ) : (
              filteredAlerts.map((n) => {
                const Icon = getIcon(n.severity);
                const colors = getColors(n.severity);
                const dateStr = new Date(n.date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <button
                    key={n.id}
                    className={`group block w-full rounded-2xl p-3 text-left transition border ${
                      !n.read
                        ? "bg-[#F9FAFB] border-[#E5E7EB]"
                        : "bg-white border-transparent hover:bg-[#F9FAFB]"
                    }`}
                    style={{
                      borderLeft: !n.read
                        ? `4px solid ${colors.accent}`
                        : "4px solid #E5E7EB",
                    }}
                    type="button"
                    onClick={() => markAlertRead(n.id)}
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full mt-0.5"
                        style={{
                          backgroundColor: colors.iconBg,
                          color: "#FFFFFF",
                        }}
                      >
                        <Icon size={14} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-1">
                          <p className="break-words text-xs font-bold text-[#111827]">
                            {n.title}
                          </p>
                          <span className="shrink-0 text-[10px] font-medium text-[#9CA3AF]">
                            {dateStr}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] leading-relaxed text-[#4B5563] line-clamp-3 whitespace-pre-line">
                          {n.message}
                        </p>
                      </div>
                      {!n.read && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-[#10B981] mt-1.5" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Link */}
          <div className="border-t border-[#F3F4F6] bg-[#FAFAFA] p-2 text-center">
            <Link
              className="inline-flex items-center gap-1 text-xs font-bold text-[#10B981] hover:underline py-1"
              href={role === "admin" ? "/admin/alerts" : "/user/notifications"}
              onClick={() => setIsOpen(false)}
            >
              View All Alerts & Notifications <ChevronRight size={13} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
