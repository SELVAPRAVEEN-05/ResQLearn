"use client";

import { useState, useEffect, useRef } from "react";
import {
  Flame,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  RotateCw,
  Search,
  Bot,
  Info,
  MapPin,
  CheckCircle2,
  ArrowRight,
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

export default function HeatwavePage() {
  const [targetDate, setTargetDate] = useState("today");
  const [data, setData] = useState<HeatwavePredictionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const datePickerRef = useRef<HTMLInputElement>(null);

  const handleOpenCalendar = () => {
    if (datePickerRef.current) {
      try {
        if (typeof datePickerRef.current.showPicker === "function") {
          datePickerRef.current.showPicker();
        } else {
          datePickerRef.current.focus();
          datePickerRef.current.click();
        }
      } catch (err) {
        console.warn("Date picker open error:", err);
      }
    }
  };

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

  const getRiskBadge = (riskStr?: string | null) => {
    const r = (riskStr || "").toUpperCase();

    if (r === "HIGH") {
      return {
        bg: "bg-[#FEE2E2]",
        text: "text-[#DC2626]",
        border: "border-[#FCA5A5]",
        icon: AlertTriangle,
        label: "High Risk",
      };
    }
    if (r === "MODERATE" || r === "MEDIUM") {
      return {
        bg: "bg-[#FEF3C7]",
        text: "text-[#D97706]",
        border: "border-[#FCD34D]",
        icon: Info,
        label: "Moderate Risk",
      };
    }

    return {
      bg: "bg-[#ECFDF5]",
      text: "text-[#059669]",
      border: "border-[#6EE7B7]",
      icon: ShieldCheck,
      label: riskStr ? `${riskStr} Risk` : "Low Risk",
    };
  };

  const riskBadge = getRiskBadge(data?.risk);
  const RiskIcon = riskBadge.icon;

  return (
    <section className="space-y-4 animate-[fadeIn_0.5s_ease-out] pb-10">
      {/* Title Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-[#111827]">
            Heatwave AI Predictor
          </h1>
          <p className="text-sm text-[#6B7280]">
            Real-time Erode Heatwave ML Forecasting
          </p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EF4444]/10 text-[#EF4444]">
          <Flame size={22} />
        </span>
      </div>

      {/* Date Search & Preset Bar */}
      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm space-y-3">
        <label
          className="block text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]"
          htmlFor="user-heatwave-target-date"
        >
          Select Prediction Date
        </label>

        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={handleSubmit}
        >
          <div className="relative flex-1 flex items-center">
            <Calendar
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none z-0"
              size={18}
            />
            <input
              className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] pl-10 pr-28 py-2.5 text-sm font-medium text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#10B981] focus:bg-white focus:outline-none transition"
              id="user-heatwave-target-date"
              placeholder="e.g. today, tomorrow, YYYY-MM-DD"
              type="text"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
            {/* Calendar Date Picker Button */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center z-10">
              <button
                type="button"
                onClick={handleOpenCalendar}
                className="relative flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold text-[#059669] bg-[#ECFDF5] hover:bg-[#D1FAE5] border border-[#A7F3D0] cursor-pointer transition shadow-2xs overflow-hidden"
                title="Select date from calendar picker"
              >
                <Calendar size={13} />
                <span>Calendar</span>
                <input
                  ref={datePickerRef}
                  type="date"
                  id="user-heatwave-date-picker"
                  aria-label="Select target prediction date from calendar"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full text-transparent bg-transparent border-none outline-none z-20"
                  onChange={(e) => {
                    if (e.target.value) {
                      setTargetDate(e.target.value);
                      fetchPrediction(e.target.value);
                    }
                  }}
                />
              </button>
            </div>
          </div>
          <button
            className="flex min-h-11 items-center justify-center gap-1.5 rounded-2xl bg-[#10B981] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0E9F72] disabled:opacity-50 sm:px-4"
            disabled={loading}
            type="submit"
          >
            {loading ? (
              <RotateCw className="animate-spin" size={16} />
            ) : (
              <Search size={16} />
            )}
            Predict
          </button>
        </form>

        {/* Quick Date Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="w-full font-medium text-[#6B7280] sm:w-auto">
            Quick Presets:
          </span>
          {["today", "tomorrow"].map((preset) => (
            <button
              key={preset}
              className={`rounded-full px-3 py-1 font-semibold transition ${
                targetDate.toLowerCase() === preset
                  ? "bg-[#10B981] text-white"
                  : "bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]"
              }`}
              type="button"
              onClick={() => {
                setTargetDate(preset);
                fetchPrediction(preset);
              }}
            >
              {preset.charAt(0).toUpperCase() + preset.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-[#E5E7EB] bg-white py-12 text-center shadow-sm">
          <RotateCw className="animate-spin text-[#10B981] mb-2" size={28} />
          <p className="text-sm font-bold text-[#111827]">
            Generating Heatwave AI Prediction...
          </p>
          <p className="text-xs text-[#6B7280]">
            Analyzing Open-Meteo weather features & XGBoost model
          </p>
        </div>
      )}

      {/* Error / Validation Alert */}
      {!loading && errorMsg && (
        <div className="rounded-3xl border border-[#FCA5A5] bg-[#FEE2E2] p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="text-[#DC2626] shrink-0 mt-0.5"
              size={20}
            />
            <div>
              <p className="text-sm font-bold text-[#991B1B]">
                Prediction Request Error
              </p>
              <p className="mt-1 text-xs leading-5 text-[#B91C1C]">
                {errorMsg}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Out of Forecast Window Warning (Friendly Message) */}
      {!loading && data && !data.available && (
        <div className="rounded-3xl border border-[#FCD34D] bg-[#FEF3C7] p-5 shadow-sm space-y-2">
          <div className="flex items-start gap-3">
            <Info className="text-[#D97706] shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-bold text-[#92400E]">
                Forecast Window Notice
              </p>
              <p className="mt-1 text-xs leading-5 text-[#B45309]">
                {data.explanation ||
                  data.error ||
                  "Weather forecast data is currently unavailable for the requested date."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Prediction Display Card */}
      {!loading && data && data.available && (
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm space-y-4">
            <Flame
              className="pointer-events-none absolute -right-6 -top-6 text-[#EF4444]/5"
              size={150}
            />

            {/* Header: Date Type + Risk Badge */}
            <div className="flex flex-wrap items-start justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F4F6] px-3 py-1 text-xs font-bold text-[#4B5563]">
                <Calendar className="text-[#10B981]" size={13} />
                {data.date_type === "today"
                  ? "Today's Live Prediction"
                  : data.date_type === "future"
                    ? "Future Date Forecast"
                    : "Historical Records"}
              </span>

              <span
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold ${riskBadge.bg} ${riskBadge.text} ${riskBadge.border}`}
              >
                <RiskIcon size={12} /> {riskBadge.label}
              </span>
            </div>

            {/* Main Temp & Location Display */}
            <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-baseline sm:justify-between">
              <div>
                <div className="flex items-center gap-1 text-xs font-semibold text-[#6B7280]">
                  <MapPin className="text-[#EF4444]" size={13} />{" "}
                  {data.location || "Erode, Tamil Nadu"}
                </div>
                <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[10px] font-bold text-[#059669]">
                  Source: {data.prediction_source || data.source || "forecast"}
                </div>
                <p className="mt-1 text-3xl font-black text-[#111827]">
                  {data.temperature != null ? `${data.temperature}°C` : "N/A"}
                </p>
                <p className="text-xs text-[#6B7280]">
                  {data.date_type === "today"
                    ? "Current Temperature"
                    : "Forecasted Max Temperature"}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-xs font-semibold text-[#6B7280]">
                  Heatwave Probability
                </p>
                <p className="text-2xl font-bold text-[#10B981]">
                  {data.probability != null
                    ? `${(data.probability * 100).toFixed(1)}%`
                    : "N/A"}
                </p>
                <p className="text-[11px] text-[#6B7280]">
                  Model Output: Class {data.prediction_class}
                </p>
              </div>
            </div>

            {/* Prediction Summary Box */}
            <div className="rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] p-4 space-y-1">
              <p className="text-xs font-bold text-[#111827]">
                Model Prediction:
              </p>
              <p className="text-xs leading-5 text-[#4B5563]">
                {data.prediction ||
                  "Prediction completed based on model weather features."}
              </p>
              <p className="text-[11px] text-[#6B7280] pt-1">
                Target Date:{" "}
                <strong className="text-[#111827]">
                  {data.formatted_date || data.date}
                </strong>
              </p>
            </div>

            {/* Metadata Footer */}
            <div className="flex flex-col gap-2 border-t border-[#F3F4F6] pt-3 text-[11px] text-[#6B7280] sm:flex-row sm:items-center sm:justify-between">
              <span className="flex min-w-0 items-center gap-1 break-words">
                <CheckCircle2 className="text-[#10B981]" size={12} />{" "}
                {data.model_name || "SafeGraph ML"}
              </span>
              <span className="break-words">
                Source: {data.weather_source || "Open-Meteo API"}
              </span>
            </div>
          </div>

          {/* Ask AI Assistant Widget Banner */}
          <Link
            className="flex items-center justify-between rounded-3xl bg-[#111827] p-5 text-left transition hover:bg-[#1F2937] shadow-sm"
            href="/user/assistant"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#10B981]/20 text-[#10B981]">
                <Bot size={18} />
              </span>
              <div>
                <p className="text-sm font-bold text-white">
                  Ask AI Assistant About This Risk
                </p>
                <p className="text-xs text-[#9CA3AF]">
                  Get custom heatwave precautions & safety advice.
                </p>
              </div>
            </div>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white">
              <ArrowRight size={16} />
            </span>
          </Link>
        </div>
      )}
    </section>
  );
}
