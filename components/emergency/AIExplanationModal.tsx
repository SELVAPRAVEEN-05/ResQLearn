"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Shield, X, Loader2, Info, CheckCircle2 } from "lucide-react";
import { EmergencyFacility } from "@/app/api/emergency/nearby/route";
import { RouteInfo } from "@/components/emergency/RouteCard";
import { HazardAnalysisResult } from "@/lib/hazardAnalysis";

interface AIExplanationModalProps {
  facility: EmergencyFacility;
  disasterType: string;
  userLocation: { lat: number; lng: number } | null;
  activeRoute?: RouteInfo | null;
  hazard?: HazardAnalysisResult | null;
  onClose: () => void;
}

export default function AIExplanationModal({
  facility,
  disasterType,
  userLocation,
  activeRoute,
  hazard,
  onClose,
}: AIExplanationModalProps) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [source, setSource] = useState<string>("SafeGraph AI");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchExplanation = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const payload = {
          disasterType,
          userLocation,
          facility,
          hazard,
          route: activeRoute
            ? {
                distanceKm: activeRoute.distanceKm,
                durationMinutes: activeRoute.durationMinutes,
              }
            : { distanceKm: facility.distanceKm },
        };

        const res = await fetch("/api/emergency/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (isMounted) {
          if (data.success && data.explanation) {
            setExplanation(data.explanation);
            setSource(data.source || "SafeGraph AI Engine");
          } else {
            setError(data.error || "Unable to generate explanation right now.");
          }
        }
      } catch {
        if (isMounted) {
          setError("Network error while requesting AI explanation.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchExplanation();

    return () => {
      isMounted = false;
    };
  }, [facility, disasterType, userLocation, activeRoute, hazard]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-[fadeIn_0.15s_ease-out]">
      <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm font-black">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Why this facility?
              </h3>
              <p className="text-[11px] font-bold text-emerald-700">
                {source}
              </p>
            </div>
          </div>

          <button
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer transition-colors"
            type="button"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Loader2 className="animate-spin text-emerald-600 mb-2" size={26} />
            <p className="text-xs font-bold text-slate-800">
              Generating grounded recommendation analysis...
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Evaluating facility type, verification status, route distance, and environmental exposure
            </p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-900">
            <p className="font-bold">Explanation Unavailable</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {/* Content */}
        {!isLoading && explanation && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 text-xs text-slate-800 space-y-2.5 leading-relaxed font-sans prose prose-emerald max-w-none">
              {explanation.split("\n\n").map((paragraph, i) => (
                <div key={i} className="whitespace-pre-line">
                  {paragraph}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500">
              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                <CheckCircle2 size={13} />
                Verified Fact Grounding Engine
              </span>
              <button
                className="rounded-xl bg-slate-900 text-white px-4 py-1.5 text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
                type="button"
                onClick={onClose}
              >
                Close Explanation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
