"use client";

import React from "react";
import {
  ShieldAlert,
  Flame,
  Droplets,
  Sun,
  Wind,
  Activity,
  ChevronDown,
} from "lucide-react";

import { DisasterType, DISASTER_OPTIONS } from "@/lib/disasterRules";

interface DisasterSelectorProps {
  selectedDisaster: DisasterType;
  onSelectDisaster: (disaster: DisasterType) => void;
}

export default function DisasterSelector({
  selectedDisaster,
  onSelectDisaster,
}: DisasterSelectorProps) {
  const getIcon = (id: DisasterType, className: string = "") => {
    switch (id) {
      case "fire":
        return <Flame className={className} size={16} />;
      case "flood":
        return <Droplets className={className} size={16} />;
      case "heatwave":
        return <Sun className={className} size={16} />;
      case "cyclone":
        return <Wind className={className} size={16} />;
      case "earthquake":
        return <Activity className={className} size={16} />;
      default:
        return <ShieldAlert className={className} size={16} />;
    }
  };

  const currentOption =
    DISASTER_OPTIONS.find((o) => o.id === selectedDisaster) ||
    DISASTER_OPTIONS[0];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label
          className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5"
          htmlFor="disaster-type-select"
        >
          <span>Emergency / Disaster Type</span>
        </label>
        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
          Disaster-Aware Prioritization
        </span>
      </div>

      {/* Select Input Dropdown for Mobile & Tablet */}
      <div className="relative">
        <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-700">
          {getIcon(selectedDisaster, "text-emerald-600")}
        </div>
        <select
          className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-9 text-xs font-bold text-slate-900 shadow-2xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
          id="disaster-type-select"
          value={selectedDisaster}
          onChange={(e) => onSelectDisaster(e.target.value as DisasterType)}
        >
          {DISASTER_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label} — {opt.description}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
          <ChevronDown size={16} />
        </div>
      </div>

      {/* Horizontal Pill Selector Buttons for Quick Access */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
        {DISASTER_OPTIONS.map((opt) => {
          const isActive = selectedDisaster === opt.id;

          return (
            <button
              key={opt.id}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
              type="button"
              onClick={() => onSelectDisaster(opt.id)}
            >
              {getIcon(opt.id, isActive ? "text-white" : "text-slate-500")}
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Helper text */}
      <p className="text-[11px] font-medium text-slate-500">
        Active rule:{" "}
        <span className="font-bold text-slate-800">
          {currentOption.description}
        </span>
      </p>
    </div>
  );
}
