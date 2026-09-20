"use client";

import React from "react";
import {
  Navigation,
  Clock,
  MapPin,
  ExternalLink,
  X,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { EmergencyFacility } from "@/app/api/emergency/nearby/route";

export interface RouteInfo {
  facility: EmergencyFacility;
  distanceKm: number;
  durationMinutes: number;
  coordinates: [number, number][];
  googleMapsUrl?: string;
  osmDirectionsUrl?: string;
  isFallback?: boolean;
}

interface RouteCardProps {
  routeInfo: RouteInfo;
  onClearRoute: () => void;
}

export default function RouteCard({ routeInfo, onClearRoute }: RouteCardProps) {
  const {
    facility,
    distanceKm,
    durationMinutes,
    googleMapsUrl,
    osmDirectionsUrl,
    isFallback,
  } = routeInfo;

  return (
    <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white p-4 sm:p-5 shadow-sm space-y-3.5 animate-[fadeIn_0.2s_ease-out]">
      {/* Header */}
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm mt-0.5">
            <Navigation size={18} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                Active Emergency Route
              </span>
              {facility.isVerified ? (
                <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                  ✓ Admin Verified
                </span>
              ) : (
                <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                  OpenStreetMap Mapped
                </span>
              )}
            </div>
            <h3 className="break-words text-sm sm:text-base font-black text-slate-900 mt-1 leading-snug">
              Route to {facility.name}
            </h3>
          </div>
        </div>

        <button
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors cursor-pointer"
          title="Clear Route"
          type="button"
          onClick={onClearRoute}
        >
          <X size={16} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-emerald-100 bg-white p-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <MapPin className="text-emerald-600" size={14} />
            <span className="text-[11px] font-bold text-slate-500">
              Road Distance
            </span>
          </div>
          <p className="text-lg font-black text-slate-900 mt-1">
            {distanceKm}{" "}
            <span className="text-xs font-bold text-slate-500">km</span>
          </p>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-white p-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Clock className="text-emerald-600" size={14} />
            <span className="text-[11px] font-bold text-slate-500">
              Estimated Time
            </span>
          </div>
          <p className="text-lg font-black text-slate-900 mt-1">
            {durationMinutes}{" "}
            <span className="text-xs font-bold text-slate-500">min</span>
          </p>
        </div>
      </div>

      {/* Disclaimer / Fallback Note */}
      {isFallback ? (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-[11px] text-amber-900">
          <AlertCircle className="text-amber-600 shrink-0" size={14} />
          <span>
            Estimated direct path displayed. Follow local road signs and
            emergency guidance.
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/60 p-2.5 text-[11px] text-emerald-900">
          <CheckCircle2 className="text-emerald-600 shrink-0" size={14} />
          <span>OSRM road routing geometry active.</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-stretch gap-2 pt-1 flex-wrap sm:flex-nowrap">
        {googleMapsUrl && (
          <a
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-xs font-bold transition-all shadow-sm cursor-pointer"
            href={googleMapsUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Navigation size={14} />
            <span className="break-words">Open Directions in Google Maps</span>
            <ExternalLink className="opacity-80" size={12} />
          </a>
        )}

        {osmDirectionsUrl && (
          <a
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2.5 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            href={osmDirectionsUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <span>OSM Maps</span>
            <ExternalLink className="text-slate-400" size={12} />
          </a>
        )}

        <button
          className="rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 px-3 py-2.5 text-xs font-bold cursor-pointer"
          type="button"
          onClick={onClearRoute}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
