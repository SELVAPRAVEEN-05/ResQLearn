"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Plus,
  Radio,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCw,
  X,
  ShieldAlert,
  BellRing,
} from "lucide-react";

type AlertItem = {
  id: number;
  alert_id: string;
  title: string;
  message: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  is_active: boolean;
  created_at: string;
};

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [form, setForm] = useState({
    title: "",
    message: "",
    severity: "High" as "Low" | "Medium" | "High" | "Critical",
  });

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/alerts");
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
      } else {
        showFeedback("error", "Failed to fetch alerts");
      }
    } catch (err: any) {
      showFeedback("error", err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      showFeedback("error", "Title and message are required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        showFeedback("success", "Emergency alert broadcasted successfully!");
        setIsCreateOpen(false);
        setForm({ title: "", message: "", severity: "High" });
        fetchAlerts();
      } else {
        const data = await res.json();
        showFeedback("error", data.error || "Failed to broadcast alert");
      }
    } catch (err: any) {
      showFeedback("error", err.message || "Network error");
    } finally {
      setSaving(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]";
      case "high":
        return "bg-[#FFF7ED] text-[#EA580C] border-[#FFEDD5]";
      case "medium":
        return "bg-[#FEFCE8] text-[#CA8A04] border-[#FEF08A]";
      default:
        return "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]";
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-[fadeIn_0.4s_ease-out]">
      {feedback && (
        <div
          className={`fixed top-4 right-4 z-70 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-xl border animate-[slideDown_0.3s_ease-out] ${
            feedback.type === "success"
              ? "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]"
              : "bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]"
          }`}
        >
          {feedback.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0F172A]">Emergency Alerts</h1>
            <span className="rounded-full bg-[#EF4444]/10 px-2.5 py-0.5 text-xs font-bold text-[#DC2626] border border-[#EF4444]/20 flex items-center gap-1">
              <Radio size={12} className="animate-pulse" /> Live Broadcast
            </span>
          </div>
          <p className="mt-1 text-sm text-[#64748B]">
            Broadcast critical weather alarms, evacuation advisories, and real-time alerts to all users.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-[#DC2626] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#B91C1C] transition active:scale-98"
        >
          <Plus size={16} /> Broadcast New Alert
        </button>
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white py-20 text-center shadow-2xs">
          <RotateCw size={32} className="animate-spin text-[#10B981] mb-3" />
          <p className="text-sm font-bold text-[#0F172A]">Loading emergency broadcasts...</p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#CBD5E1] bg-white py-20 text-center">
          <BellRing size={40} className="text-[#94A3B8] mb-3" />
          <h3 className="text-base font-bold text-[#0F172A]">No Active Alerts</h3>
          <p className="mt-1 text-xs text-[#64748B] max-w-sm">
            There are currently no active disaster broadcasts or public warnings.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alt) => (
            <div
              key={alt.id}
              className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-2xs transition hover:border-[#CBD5E1]"
            >
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FEF2F2] text-[#DC2626]">
                  <ShieldAlert size={20} />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-[#0F172A]">{alt.title}</h3>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getSeverityBadge(
                        alt.severity
                      )}`}
                    >
                      {alt.severity}
                    </span>
                    <span className="rounded-full bg-[#DCFCE7] text-[#15803D] px-2 py-0.5 text-[10px] font-bold">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-[#475569] leading-relaxed max-w-2xl">{alt.message}</p>
                  <p className="text-[11px] text-[#94A3B8] flex items-center gap-1 pt-1 font-medium">
                    <Clock size={12} /> Broadcasted {new Date(alt.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Broadcast Alert Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]">
          <div className="flex flex-col w-full max-w-lg max-h-[90vh] rounded-3xl bg-white shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-white px-6 py-4 shrink-0">
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#0F172A]">Broadcast Emergency Alert</h3>
                <p className="text-xs text-[#64748B]">Push an immediate advisory or alert to the user network</p>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="rounded-full p-2 text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form id="alert-form" onSubmit={handleCreateAlert} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-[#334155]">Alert Title <span className="text-[#DC2626]">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flash Flood Warning - Immediate Evacuation"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] p-3 text-sm font-medium text-[#0F172A] focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#334155]">Severity Level <span className="text-[#DC2626]">*</span></label>
                <select
                  value={form.severity}
                  onChange={(e) => setForm({ ...form, severity: e.target.value as any })}
                  className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] p-3 text-sm font-medium text-[#0F172A] focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20 focus:outline-none"
                >
                  <option value="Low">Low - Informational</option>
                  <option value="Medium">Medium - Advisory</option>
                  <option value="High">High - Emergency Alert</option>
                  <option value="Critical">Critical - Immediate Evacuation / Life Hazard</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#334155]">Alert Message & Instructions <span className="text-[#DC2626]">*</span></label>
                <textarea
                  required
                  rows={4}
                  placeholder="State the active danger, affected regions, safe zones, and immediate life-saving actions..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] p-3 text-sm font-medium text-[#0F172A] focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20 focus:outline-none resize-y max-h-48 overflow-y-auto"
                />
              </div>
            </form>

            {/* STICKY ALWAYS-VISIBLE FOOTER */}
            <div className="flex items-center justify-end gap-3 border-t border-[#E2E8F0] bg-[#F8FAFC] px-6 py-4 shrink-0">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-xl border border-[#CBD5E1] bg-white px-4 py-2.5 text-xs font-bold text-[#334155] hover:bg-[#F1F5F9] transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="alert-form"
                disabled={saving}
                className="rounded-xl bg-[#DC2626] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#B91C1C] shadow-sm disabled:opacity-50 flex items-center gap-1.5 transition active:scale-98"
              >
                {saving ? (
                  <>
                    <RotateCw size={14} className="animate-spin" /> Broadcasting...
                  </>
                ) : (
                  "Broadcast Alert"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
