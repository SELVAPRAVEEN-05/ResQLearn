"use client";

import React from "react";
import {
  Building2,
  Phone,
  MapPin,
  Flame,
  Shield,
  Home,
  AlertCircle,
  Loader2,
  Info,
} from "lucide-react";

import { EmergencyFacility } from "@/app/api/emergency/nearby/route";
import {
  DisasterType,
  calculateRelevanceScore,
  getDisasterRelevanceReason,
} from "@/lib/disasterRules";

export type FacilityCategoryFilter =
  | "all"
  | "hospital"
  | "fire_station"
  | "police_station"
  | "shelter";

interface FacilityListProps {
  facilities: EmergencyFacility[];
  isLoading: boolean;
  errorMsg: string | null;
  selectedDisaster: DisasterType;
  selectedCategory: FacilityCategoryFilter;
  onCategoryChange: (category: FacilityCategoryFilter) => void;
  selectedFacilityId: string | null;
  onFacilityClick: (facility: EmergencyFacility) => void;
  onRequestRoute?: (facility: EmergencyFacility) => void;
  onExplainFacility?: (facility: EmergencyFacility) => void;
  radiusKm?: number;
}

function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);

    return `${meters} m away`;
  }

  return `${distanceKm.toFixed(1)} km away`;
}

export default function FacilityList({
  facilities,
  isLoading,
  errorMsg,
  selectedDisaster,
  selectedCategory,
  onCategoryChange,
  selectedFacilityId,
  onFacilityClick,
  onRequestRoute,
  onExplainFacility,
  radiusKm = 5,
}: FacilityListProps) {
  const categories: {
    id: FacilityCategoryFilter;
    label: string;
    icon: React.ElementType;
  }[] = [
    { id: "all", label: "All Facilities", icon: Building2 },
    { id: "hospital", label: "Hospitals", icon: Building2 },
    { id: "fire_station", label: "Fire Stations", icon: Flame },
    { id: "police_station", label: "Police", icon: Shield },
    { id: "shelter", label: "Shelters", icon: Home },
  ];

  // Calculate disaster relevance scores and sort
  const scoredFacilities = facilities
    .map((f) => {
      const score = calculateRelevanceScore(
        selectedDisaster,
        f.type,
        f.distanceKm,
        f.isVerified,
      );
      const reason = getDisasterRelevanceReason(selectedDisaster, f.type);

      return { ...f, relevanceScore: score, priorityReason: reason };
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Filter facilities by selected category
  const filteredFacilities = scoredFacilities.filter((f) => {
    if (selectedCategory === "all") return true;

    return f.type === selectedCategory;
  });

  return (
    <div className="space-y-4">
      {/* Category Filter Tabs Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Building2 className="text-emerald-600" size={18} />
          <span>All Nearby Facilities</span>
          <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-700">
            {filteredFacilities.length}
          </span>
        </h3>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;

          let count = facilities.length;

          if (cat.id !== "all") {
            count = facilities.filter((f) => f.type === cat.id).length;
          }

          return (
            <button
              key={cat.id}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
              }`}
              type="button"
              onClick={() => onCategoryChange(cat.id)}
            >
              <Icon
                className={isActive ? "text-emerald-400" : "text-slate-400"}
                size={14}
              />
              <span>{cat.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  isActive
                    ? "bg-slate-800 text-slate-300"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-2xs">
          <Loader2 className="animate-spin text-emerald-600 mb-2" size={24} />
          <p className="text-xs font-bold text-slate-800">
            Finding nearby emergency facilities...
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Searching OpenStreetMap records within {radiusKm} km
          </p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && errorMsg && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-900">
          <AlertCircle className="text-rose-600 shrink-0 mt-0.5" size={18} />
          <div>
            <p className="font-bold">Facility Search Error</p>
            <p className="mt-0.5 text-rose-800">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !errorMsg && filteredFacilities.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <Building2 className="mx-auto text-slate-300 mb-2" size={28} />
          <p className="text-xs font-bold text-slate-800">
            No facilities found
          </p>
          <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
            No mapped emergency facilities were found within {radiusKm} km of
            this location.
          </p>
        </div>
      )}

      {/* Facility Cards List */}
      {!isLoading && !errorMsg && filteredFacilities.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filteredFacilities.map((facility) => {
            const isSelected = selectedFacilityId === facility.id;

            let iconBg = "bg-slate-100 text-slate-600";
            let typeLabel = "Facility";
            let Icon = Building2;

            if (facility.type === "hospital") {
              iconBg = "bg-rose-50 text-rose-600 border-rose-200";
              typeLabel = "Hospital";
              Icon = Building2;
            } else if (facility.type === "fire_station") {
              iconBg = "bg-amber-50 text-amber-600 border-amber-200";
              typeLabel = "Fire Station";
              Icon = Flame;
            } else if (facility.type === "police_station") {
              iconBg = "bg-indigo-50 text-indigo-600 border-indigo-200";
              typeLabel = "Police Station";
              Icon = Shield;
            } else if (facility.type === "shelter") {
              iconBg = "bg-teal-50 text-teal-600 border-teal-200";
              typeLabel = "Emergency Shelter";
              Icon = Home;
            }

            return (
              <div
                key={facility.id}
                role="button"
                tabIndex={0}
                className={`group relative flex w-full flex-col justify-between text-left rounded-2xl border p-4 transition-all cursor-pointer ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-md"
                    : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50/60 shadow-2xs"
                }`}
                onClick={() => onFacilityClick(facility)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onFacilityClick(facility);
                  }
                }}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${iconBg}`}
                      >
                        <Icon size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                            {typeLabel}
                          </span>
                          {facility.isVerified ? (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.2 text-[10px] font-extrabold text-emerald-800 border border-emerald-200">
                              ✓ Admin Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.2 text-[10px] font-medium text-slate-500">
                              OpenStreetMap mapped facility
                            </span>
                          )}
                          {facility.isAvailable === false && (
                            <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.2 text-[10px] font-extrabold text-rose-800 border border-rose-200">
                              Unavailable
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-black text-slate-900 group-hover:text-emerald-700 leading-snug mt-0.5">
                          {facility.name}
                        </h4>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                      {formatDistance(facility.distanceKm)}
                    </span>
                  </div>

                  {/* Priority reason */}
                  {selectedDisaster !== "general" && (
                    <div className="mt-2 text-[11px] text-slate-500 font-medium">
                      <span className="font-bold text-slate-700">Role: </span>
                      <span>{facility.priorityReason}</span>
                    </div>
                  )}

                  {facility.address && (
                    <p className="mt-2 flex items-start gap-1.5 text-[11px] text-slate-600 line-clamp-2">
                      <MapPin
                        className="shrink-0 text-slate-400 mt-0.5"
                        size={13}
                      />
                      <span>{facility.address}</span>
                    </p>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] gap-2 flex-wrap">
                  {facility.phone ? (
                    <a
                      className="inline-flex items-center gap-1 font-bold text-blue-600 hover:underline"
                      href={`tel:${facility.phone}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Phone size={12} />
                      <span>{facility.phone}</span>
                    </a>
                  ) : (
                    <span className="text-slate-400 text-[10px]">
                      No phone
                    </span>
                  )}

                  <div className="flex items-center gap-1.5">
                    {onRequestRoute && (
                      <button
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-1 text-[10px] font-extrabold hover:bg-emerald-100 cursor-pointer"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRequestRoute(facility);
                        }}
                      >
                        🧭 Route
                      </button>
                    )}

                    {onExplainFacility && (
                      <button
                        className="inline-flex items-center gap-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 px-2 py-1 text-[10px] font-extrabold hover:bg-teal-100 cursor-pointer"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onExplainFacility(facility);
                        }}
                      >
                        ✨ Why this?
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Safety Wording Disclaimer */}
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-500">
        <Info className="text-slate-400 shrink-0" size={14} />
        <span>
          Facility availability and suitability may change during an emergency.
          Follow instructions from local emergency authorities.
        </span>
      </div>
    </div>
  );
}
