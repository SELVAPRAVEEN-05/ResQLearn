"use client";

import React from "react";
import dynamic from "next/dynamic";
import { MapPin, Loader2 } from "lucide-react";

import { EmergencyFacility } from "@/app/api/emergency/nearby/route";
import { RouteInfo } from "@/components/emergency/RouteCard";

interface EmergencyMapProps {
  center: [number, number];
  zoom: number;
  userLocation: { lat: number; lng: number } | null;
  facilities?: EmergencyFacility[];
  selectedFacilityId?: string | null;
  activeRoute?: RouteInfo | null;
  onFacilitySelect?: (facility: EmergencyFacility) => void;
  onRequestRoute?: (facility: EmergencyFacility) => void;
  height?: string;
  isLoading?: boolean;
}

const EmergencyMapInner = dynamic(() => import("./EmergencyMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[min(58vh,450px)] min-h-[320px] w-full flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center shadow-inner">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 mb-3 animate-pulse">
        <MapPin size={24} />
      </div>
      <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
        <Loader2 className="animate-spin text-emerald-600" size={16} />
        Loading Interactive Emergency Map...
      </div>
      <p className="text-xs text-slate-400 mt-1">
        Initializing OpenStreetMap geospatial canvas
      </p>
    </div>
  ),
});

export default function EmergencyMap({
  center,
  zoom,
  userLocation,
  facilities = [],
  selectedFacilityId,
  activeRoute,
  onFacilitySelect,
  onRequestRoute,
  height = "450px",
  isLoading = false,
}: EmergencyMapProps) {
  return (
    <div className="relative w-full">
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-white/75 backdrop-blur-xs">
          <div className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xl">
            <Loader2 className="animate-spin text-emerald-400" size={15} />
            Finding Nearby Emergency Facilities...
          </div>
        </div>
      )}
      <EmergencyMapInner
        activeRoute={activeRoute}
        center={center}
        facilities={facilities}
        height={height}
        selectedFacilityId={selectedFacilityId}
        userLocation={userLocation}
        zoom={zoom}
        onFacilitySelect={onFacilitySelect}
        onRequestRoute={onRequestRoute}
      />
    </div>
  );
}
