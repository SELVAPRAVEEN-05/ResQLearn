"use client";

import { useState, useEffect } from "react";
import {
  Flame,
  Calendar,
  AlertTriangle,
  RotateCw,
  Search,
  Bot,
  Info,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";

interface HeatwavePredictionData {
  available: boolean;
  date?: string;
  formatted_date?: string;
  location?: string;
  temperature?: number | null;
  risk?: string | null;
  probability?: number | null;
  prediction_class?: number | null;
  prediction?: string | null;
  source?: string;
  prediction_source?: string;
  weather_source?: string;
  date_type?: string;
  model_name?: string | null;
  explanation?: string;
  error?: string;
}

export default function AdminHeatwavePage() {
  const [targetDate, setTargetDate] = useState("today");
  const [data, setData] = useState<HeatwavePredictionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const quickPresets = [
    "today",
    "tomorrow",
    "next week",
    "next month",
    "3 months from now",
    "next year",
    "2026-09-20",
  ];

  const fetchPrediction = async (dateParam: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/heatwave/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dateParam }),
      });

      const result = await res.json();

      if (res.ok) {
        setData(result);
      } else {
        setErrorMsg(result.error || "Failed to fetch heatwave prediction.");
      }
    } catch {
      setErrorMsg(
        "Network connection error. Please verify your connection to the server.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction("today");
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDate.trim()) return;
    fetchPrediction(targetDate.trim());
  };

  const isHighOrModerateRisk =
    (data?.risk || "").toUpperCase() === "HIGH" ||
    (data?.risk || "").toUpperCase() === "MODERATE" ||
    (data?.risk || "").toUpperCase() === "MEDIUM";

  return (
    <div className="space-y-6 pb-12 animate-[fadeIn_0.4s_ease-out]">
      {/* Header section */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0F172A]">
              Admin Heatwave AI Predictor
            </h1>
            <span className="inline-flex w-fit items-center gap-1 rounded-full border border-[#EF4444]/20 bg-[#EF4444]/10 px-3 py-1 text-xs font-bold text-[#DC2626]">
              <Flame size={14} /> XGBoost ML Engine
            </span>
          </div>
          <p className="mt-1 text-sm text-[#64748B]">
            Real-time heatwave risk assessment, temperature telemetry, and model
            diagnostics for Erode, Tamil Nadu.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            className="flex items-center gap-1.5 rounded-xl border border-[#CBD5E1] bg-white px-4 py-2.5 text-xs font-bold text-[#334155] hover:bg-[#F8FAFC] shadow-2xs transition"
            href="/admin/alerts"
          >
            <ShieldAlert className="text-[#EA580C]" size={15} /> View Emergency
            Alerts
          </Link>
        </div>
      </div>

      {/* Date Search & Preset Bar Card */}
      <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-2xs space-y-4">
        <label
          className="block text-xs font-bold uppercase tracking-wider text-[#64748B]"
          htmlFor="admin-heatwave-target-date"
        >
          Select Forecasting Target Date
        </label>

        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={handleSubmit}
        >
          <div className="relative flex-1">
            <Calendar
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
              size={18}
            />
            <input
              className="w-full rounded-2xl border border-[#CBD5E1] bg-[#F8FAFC] pl-11 pr-4 py-3 text-sm font-medium text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#10B981] focus:bg-white focus:ring-2 focus:ring-[#10B981]/20 focus:outline-none transition"
              id="admin-heatwave-target-date"
              placeholder="e.g. today, tomorrow, 2026-09-20"
              type="text"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>
          <button
            className="flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#10B981] px-6 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#059669] disabled:opacity-50 active:scale-98 sm:px-6"
            disabled={loading}
            type="submit"
          >
            {loading ? (
              <RotateCw className="animate-spin" size={16} />
            ) : (
              <Search size={16} />
            )}
            Run AI Prediction
          </button>
        </form>

        {/* Quick Date Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="w-full font-bold text-[#64748B] sm:w-auto">
            Quick Presets:
          </span>
          {quickPresets.map((preset) => (
            <button
              key={preset}
              className={`rounded-full px-3.5 py-1 font-bold transition ${
                targetDate.toLowerCase() === preset.toLowerCase()
                  ? "bg-[#10B981] text-white shadow-2xs"
                  : "bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]"
              }`}
              type="button"
              onClick={() => {
                setTargetDate(preset);
                fetchPrediction(preset);
              }}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-[#E2E8F0] bg-white py-16 text-center shadow-2xs">
          <RotateCw className="animate-spin text-[#10B981] mb-3" size={32} />
          <p className="text-sm font-bold text-[#0F172A]">
            Running SafeGraph AI ML Pipeline...
          </p>
          <p className="text-xs text-[#64748B]">
            Fetching live Open-Meteo weather features & processing XGBoost model
          </p>
        </div>
      )}

      {/* Error Alert */}
      {!loading && errorMsg && (
        <div className="rounded-3xl border border-[#FCA5A5] bg-[#FEF2F2] p-6 shadow-2xs">
          <div className="flex items-start gap-3.5">
            <AlertTriangle
              className="text-[#DC2626] shrink-0 mt-0.5"
              size={22}
            />
            <div>
              <p className="text-sm font-bold text-[#991B1B]">
                Prediction Request Error
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#B91C1C]">
                {errorMsg}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Forecast Notice */}
      {!loading && data && !data.available && (
        <div className="rounded-3xl border border-[#FCD34D] bg-[#FEF3C7] p-6 shadow-2xs space-y-2">
          <div className="flex items-start gap-3.5">
            <Info className="text-[#D97706] shrink-0 mt-0.5" size={22} />
            <div>
              <p className="text-sm font-bold text-[#92400E]">
                Forecast Window Notice
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#B45309]">
                {data.explanation ||
                  data.error ||
                  "Weather forecast data is currently unavailable for the requested date."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Prediction & Risk Alert Section */}
      {!loading && data && data.available && (
        <div className="space-y-6">
          {/* Admin Heatwave Risk Alert Card (Displayed prominently when Moderate/High risk detected) */}
          {isHighOrModerateRisk && (
            <div className="rounded-3xl border border-[#FCA5A5] bg-[#FEF2F2] p-6 shadow-md relative overflow-hidden">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#DC2626] text-white shadow-sm">
                    <ShieldAlert size={24} />
                  </span>
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#DC2626] text-white px-3 py-0.5 text-[11px] font-black uppercase tracking-wide">
                        Automated System Alert
                      </span>
                      <span className="text-xs font-bold text-[#991B1B]">
                        Broadcasted to Student & Admin Modules
                      </span>
                    </div>
                    <h2 className="text-lg font-black text-[#7F1D1D]">
                      Heatwave Risk Alert
                    </h2>
                    <div className="mt-2 text-sm font-bold text-[#991B1B] space-y-1">
                      <p>
                        Location:{" "}
                        <strong>{data.location || "Erode, Tamil Nadu"}</strong>{" "}
                        — {data.formatted_date || data.date}
                      </p>
                      <p>
                        Temperature:{" "}
                        <strong className="text-[#DC2626]">
                          {data.temperature}°C
                        </strong>{" "}
                        &nbsp;|&nbsp; Risk:{" "}
                        <strong className="uppercase">{data.risk}</strong>
                      </p>
                      <p>
                        Prediction Source:{" "}
                        <strong>
                          {data.prediction_source || data.source || "forecast"}
                        </strong>
                      </p>
                    </div>
                    <p className="text-xs text-[#991B1B] leading-relaxed pt-2">
                      {data.prediction}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Telemetry & Model Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Main Prediction Card */}
            <div className="min-w-0 lg:col-span-2 relative overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-2xs space-y-5">
              <Flame
                className="pointer-events-none absolute -right-10 -top-10 text-[#EF4444]/5"
                size={200}
              />

              {/* Header: Date Type + Risk Badge */}
              <div className="flex flex-wrap items-start justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F1F5F9] px-3.5 py-1 text-xs font-bold text-[#475569]">
                  <Calendar className="text-[#10B981]" size={14} />
                  {data.date_type === "today"
                    ? "Today's Live Telemetry"
                    : data.date_type === "future"
                      ? "Future Date ML Forecast"
                      : "Historical Log Entry"}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF5] px-3 py-1 text-[10px] font-bold text-[#059669]">
                  Source: {data.prediction_source || data.source || "forecast"}
                </span>
              </div>

              {/* Main Temp & Location Display */}
              <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-baseline sm:justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#64748B]">
                    <MapPin className="text-[#EF4444]" size={14} />{" "}
                    {data.location || "Erode, Tamil Nadu"}
                  </div>
                  <p className="mt-2 text-4xl sm:text-5xl font-black text-[#0F172A]">
                    {data.temperature != null ? `${data.temperature}°C` : "N/A"}
                  </p>
                  <p className="mt-1 text-xs font-medium text-[#64748B]">
                    {data.date_type === "today"
                      ? "Current Live Temperature"
                      : "Forecasted Peak Temperature"}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                    Heatwave Probability
                  </p>
                  <p className="mt-1 text-3xl font-black text-[#10B981]">
                    {data.probability != null
                      ? `${(data.probability * 100).toFixed(1)}%`
                      : "N/A"}
                  </p>
                  <p className="text-[11px] font-bold text-[#64748B] mt-0.5">
                    Model Classification: Class {data.prediction_class}
                  </p>
                </div>
              </div>

              {/* Prediction Summary Box */}
              <div className="rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-5 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                  AI Diagnostic Inference
                </p>
                <p className="text-xs leading-relaxed text-[#334155] font-medium">
                  {data.prediction ||
                    "Model prediction computed based on Open-Meteo feature vector."}
                </p>
                {data.explanation && (
                  <p className="text-xs leading-relaxed text-[#64748B] pt-1">
                    {data.explanation}
                  </p>
                )}
                <div className="flex flex-col gap-1 border-t border-[#E2E8F0] pt-2 text-[11px] text-[#94A3B8] sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    Target Date:{" "}
                    <strong className="text-[#0F172A]">
                      {data.formatted_date || data.date}
                    </strong>
                  </span>
                  <span>
                    Execution:{" "}
                    <strong className="text-[#059669]">Success 200 OK</strong>
                  </span>
                </div>
              </div>

              {/* Technical Pipeline Telemetry Footer */}
              <div className="flex flex-col gap-2 border-t border-[#F1F5F9] pt-2 text-xs text-[#64748B] sm:flex-row sm:items-center sm:justify-between">
                <span className="flex min-w-0 items-center gap-1.5 break-words font-bold">
                  <CheckCircle2 className="text-[#10B981]" size={14} /> Model:{" "}
                  {data.model_name || "SafeGraph XGBoost Classifier"}
                </span>
                <span className="break-words font-semibold">
                  Weather API:{" "}
                  {data.weather_source || "Open-Meteo ERA5 / Forecast"}
                </span>
              </div>
            </div>

            {/* Right Col: Admin System Metrics & Guidance */}
            <div className="space-y-4">
              <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-[#0F172A]">
                  Safety & Emergency Protocol
                </h3>
                <div className="space-y-3 text-xs text-[#475569]">
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#10B981]/15 text-[#059669] font-bold text-[10px]">
                      1
                    </span>
                    <p>
                      High temperature forecasts automatically broadcast alerts
                      across Student & Admin consoles.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#10B981]/15 text-[#059669] font-bold text-[10px]">
                      2
                    </span>
                    <p>
                      Alert notifications persist in Neon PostgreSQL and update
                      unread counts globally.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#10B981]/15 text-[#059669] font-bold text-[10px]">
                      3
                    </span>
                    <p>
                      Admins can view and send custom broadcast warnings under
                      Emergency Alerts.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-[#0F172A] p-6 text-white shadow-2xs space-y-3">
                <div className="flex items-center gap-2">
                  <Bot className="text-[#10B981]" size={20} />
                  <h3 className="text-sm font-bold text-white">
                    Disaster Knowledge RAG
                  </h3>
                </div>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  Query the explainable offline Knowledge Base & Gemini LLM
                  grounding for custom heatwave safety protocols.
                </p>
                <Link
                  className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[#10B981] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#059669] transition"
                  href="/user/assistant"
                >
                  Launch AI Assistant <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
