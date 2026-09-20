"use client";

import React from "react";
import {
  Navigation,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info,
  Compass,
} from "lucide-react";

export type LocationState =
  | "initial"
  | "requesting"
  | "found"
  | "denied"
  | "unavailable"
  | "unsupported"
  | "error";

interface LocationControlsProps {
  locationState: LocationState;
  onUseMyLocation: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  customErrorMsg?: string | null;
}

export default function LocationControls({
  locationState,
  onUseMyLocation,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  customErrorMsg,
}: LocationControlsProps) {
  const isRequesting = locationState === "requesting";

  return (
    <div className="space-y-3.5">
      {/* Action Controls Row */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        {/* Use My Location Button */}
        <button
          className="flex w-full sm:w-auto shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-98 disabled:opacity-75 cursor-pointer"
          disabled={isRequesting}
          type="button"
          onClick={onUseMyLocation}
        >
          {isRequesting ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              <span>Detecting Location...</span>
            </>
          ) : (
            <>
              <Navigation size={16} />
              <span>Use My Location</span>
            </>
          )}
        </button>

        {/* Manual Location Search Input */}
        <form
          className="flex flex-1 items-center gap-2"
          onSubmit={onSearchSubmit}
        >
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={15}
            />
            <input
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder="Search for a city, landmark, or district..."
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <button
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200 active:scale-98 shrink-0 cursor-pointer"
            type="submit"
          >
            <Compass size={14} />
            <span className="hidden xs:inline">Search</span>
          </button>
        </form>
      </div>

      {/* State Feedback Banner */}
      {locationState === "requesting" && (
        <div className="flex items-center gap-2.5 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
          <Loader2 className="animate-spin text-blue-600 shrink-0" size={16} />
          <span>
            Requesting GPS permissions and fetching your precise coordinates...
          </span>
        </div>
      )}

      {locationState === "found" && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
          <CheckCircle2 className="text-emerald-600 shrink-0" size={16} />
          <span>
            Location found successfully! Map centered at your position.
          </span>
        </div>
      )}

      {locationState === "denied" && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={16} />
          <div>
            <p className="font-bold">Location Permission Denied</p>
            <p className="mt-0.5 text-amber-800">
              Location permission was denied. Please allow location access in
              your browser settings or search for a place manually.
            </p>
          </div>
        </div>
      )}

      {locationState === "unavailable" && (
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900">
          <AlertCircle className="text-rose-600 shrink-0 mt-0.5" size={16} />
          <div>
            <p className="font-bold">Location Unavailable</p>
            <p className="mt-0.5 text-rose-800">
              {customErrorMsg ||
                "Unable to determine your location. Please try again or search for a place."}
            </p>
          </div>
        </div>
      )}

      {locationState === "unsupported" && (
        <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-100 p-3 text-xs text-slate-800">
          <Info className="text-slate-500 shrink-0 mt-0.5" size={16} />
          <div>
            <p className="font-bold">Geolocation Unsupported</p>
            <p className="mt-0.5 text-slate-600">
              Location services are not supported by this browser. Please use a
              modern browser or enter location manually.
            </p>
          </div>
        </div>
      )}

      {locationState === "error" && (
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900">
          <AlertCircle className="text-rose-600 shrink-0 mt-0.5" size={16} />
          <div>
            <p className="font-bold">Error Obtaining Location</p>
            <p className="mt-0.5 text-rose-800">
              {customErrorMsg ||
                "An error occurred while fetching location coordinates."}
            </p>
          </div>
        </div>
      )}

      {locationState === "initial" && (
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          <Info className="text-slate-400 shrink-0" size={15} />
          <span>
            Click <strong>Use My Location</strong> to display your current GPS
            coordinates on the map.
          </span>
        </div>
      )}
    </div>
  );
}
