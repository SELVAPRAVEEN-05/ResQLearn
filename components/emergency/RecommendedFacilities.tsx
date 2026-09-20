"use client";

import React from "react";
import {
  Building2,
  Flame,
  Shield,
  Home,
  MapPin,
  Phone,
  Sparkles,
} from "lucide-react";

import { EmergencyFacility } from "@/app/api/emergency/nearby/route";
import {
  DisasterType,
  calculateRelevanceScore,
  getDisasterRelevanceReason,
} from "@/lib/disasterRules";

interface RecommendedFacilitiesProps {
  facilities: EmergencyFacility[];
  selectedDisaster: DisasterType;
  selectedFacilityId: string | null;
  onFacilityClick: (facility: EmergencyFacility) => void;
  onRequestRoute?: (facility: EmergencyFacility) => void;
  onExplainFacility?: (facility: EmergencyFacility) => void;
}

function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);

    return `${meters} m away`;
  }

  return `${distanceKm.toFixed(1)} km away`;
}

export default function RecommendedFacilities({
  facilities,
  selectedDisaster,
  selectedFacilityId,
  onFacilityClick,
  onRequestRoute,
  onExplainFacility,
}: RecommendedFacilitiesProps) {
  if (facilities.length === 0) return null;

  // Calculate relevanceScore for each facility and sort descending
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

  // Take top 3-4 recommended facilities
  const topRecommendations = scoredFacilities.slice(0, 4);

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-2xs">
            <Sparkles size={15} />
          </div>
          <h3 className="text-sm font-black text-slate-900 tracking-tight">
            Recommended Nearby Facilities
          </h3>
        </div>
        <span className="text-[11px] font-bold text-slate-500">
          Prioritized by Disaster Relevance & Proximity
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {topRecommendations.map((facility, index) => {
          const isSelected = selectedFacilityId === facility.id;

          let Icon = Building2;
          let badgeBg = "bg-slate-100 text-slate-700 border-slate-200";
          let categoryLabel = "Facility";

          if (facility.type === "hospital") {
            Icon = Building2;
            badgeBg = "bg-rose-50 text-rose-800 border-rose-200";
            categoryLabel = "Hospital";
          } else if (facility.type === "fire_station") {
            Icon = Flame;
            badgeBg = "bg-amber-50 text-amber-800 border-amber-200";
            categoryLabel = "Fire Station";
          } else if (facility.type === "police_station") {
            Icon = Shield;
            badgeBg = "bg-indigo-50 text-indigo-800 border-indigo-200";
            categoryLabel = "Police Station";
          } else if (facility.type === "shelter") {
            Icon = Home;
            badgeBg = "bg-teal-50 text-teal-800 border-teal-200";
            categoryLabel = "Emergency Shelter";
          }

          return (
            <div
              key={`rec_${facility.id}`}
              className={`group relative flex w-full flex-col justify-between text-left rounded-2xl border p-4 transition-all cursor-pointer ${
                isSelected
                  ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-md"
                  : "border-emerald-200/80 bg-gradient-to-br from-emerald-50/30 via-white to-teal-50/20 hover:border-emerald-400 hover:bg-white shadow-2xs"
              }`}
              role="button"
              tabIndex={0}
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
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-black text-white">
                      #{index + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-1 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border ${badgeBg}`}
                        >
                          <Icon size={12} />
                          <span>{categoryLabel}</span>
                        </span>
                        {facility.isVerified ? (
                          <span className="inline-flex items-center rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-800 border border-emerald-200">
                            ✓ Admin Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                            OSM mapped
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

                {/* Priority Reason Explanation */}
                <div className="mt-2.5 rounded-xl bg-slate-50 border border-slate-100 p-2 text-[11px] text-slate-600">
                  <span className="font-bold text-slate-700">Relevance: </span>
                  <span>{facility.priorityReason}</span>
                </div>

                {facility.address && (
                  <p className="mt-2 flex items-start gap-1.5 text-[11px] text-slate-600 line-clamp-1">
                    <MapPin
                      className="shrink-0 text-slate-400 mt-0.5"
                      size={12}
                    />
                    <span>{facility.address}</span>
                  </p>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] gap-2 flex-wrap">
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
                  <span className="text-slate-400 text-[10px]">No phone</span>
                )}

                <div className="flex items-center gap-1.5">
                  {onRequestRoute && (
                    <button
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 text-white px-2.5 py-1 text-[10px] font-bold hover:bg-emerald-700 cursor-pointer shadow-2xs"
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
                      className="inline-flex items-center gap-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 px-2 py-1 text-[10px] font-bold hover:bg-teal-100 cursor-pointer"
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
    </div>
  );
}
