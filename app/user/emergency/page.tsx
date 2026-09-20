"use client";

import React, { useState, useEffect } from "react";
import { MapPin, ShieldAlert, Crosshair, Bell } from "lucide-react";

import LocationControls, {
  LocationState,
} from "@/components/emergency/LocationControls";
import EmergencyMap from "@/components/emergency/EmergencyMap";
import DisasterSelector from "@/components/emergency/DisasterSelector";
import RecommendedFacilities from "@/components/emergency/RecommendedFacilities";
import FacilityList, {
  FacilityCategoryFilter,
} from "@/components/emergency/FacilityList";
import RouteCard, { RouteInfo } from "@/components/emergency/RouteCard";
import AIExplanationModal from "@/components/emergency/AIExplanationModal";
import { EmergencyFacility } from "@/app/api/emergency/nearby/route";
import { DisasterType } from "@/lib/disasterRules";
import { HazardAnalysisResult } from "@/lib/hazardAnalysis";
import { EmergencyNotification } from "@/app/api/emergency/notifications/route";

// Default map center (Tamil Nadu / Erode region fallback center)
const DEFAULT_CENTER: [number, number] = [11.341, 77.7172];

interface UserCoordinates {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
}

export default function StudentEmergencyPage() {
  const [locationState, setLocationState] = useState<LocationState>("initial");
  const [coords, setCoords] = useState<UserCoordinates | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState<number>(12);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Step 3 Disaster Selector State
  const [selectedDisaster, setSelectedDisaster] =
    useState<DisasterType>("general");

  // Step 2 & 4 Facilities State
  const [facilities, setFacilities] = useState<EmergencyFacility[]>([]);
  const [isLoadingFacilities, setIsLoadingFacilities] =
    useState<boolean>(false);
  const [facilityError, setFacilityError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<FacilityCategoryFilter>("all");
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(
    null,
  );

  // Step 5 Routing State
  const [activeRoute, setActiveRoute] = useState<RouteInfo | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(false);

  // Step 6 Hazard Analysis Cache State
  const [hazardCache, setHazardCache] = useState<
    Record<string, HazardAnalysisResult>
  >({});

  // Step 7 AI Explanation Modal State
  const [explainingFacility, setExplainingFacility] =
    useState<EmergencyFacility | null>(null);

  // Step 7 Emergency Notifications State
  const [notifications, setNotifications] = useState<EmergencyNotification[]>(
    [],
  );

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(
          `/api/emergency/notifications?disaster=${selectedDisaster}`,
        );
        const data = await res.json();

        if (res.ok && data.success && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      } catch (e) {
        // Silent notification fetch failure
      }
    };

    fetchNotifications();
  }, [selectedDisaster]);

  const fetchNearbyFacilities = async (lat: number, lng: number) => {
    setIsLoadingFacilities(true);
    setFacilityError(null);

    try {
      const [nearbyRes, verifiedRes] = await Promise.all([
        fetch(`/api/emergency/nearby?lat=${lat}&lng=${lng}&radius=5000`),
        fetch(`/api/emergency/verified?lat=${lat}&lng=${lng}`),
      ]);

      const nearbyData = await nearbyRes.json();
      const verifiedData = await verifiedRes.json();

      const combined: EmergencyFacility[] = [];

      if (verifiedData.success && Array.isArray(verifiedData.facilities)) {
        combined.push(...verifiedData.facilities);
      }

      if (nearbyData.success && Array.isArray(nearbyData.facilities)) {
        const verifiedNames = new Set(
          combined.map((f) => f.name.toLowerCase().trim()),
        );
        const filteredOsm = nearbyData.facilities.filter(
          (osm: EmergencyFacility) =>
            !verifiedNames.has(osm.name.toLowerCase().trim()),
        );

        combined.push(...filteredOsm);
      }

      setFacilities(combined);
    } catch {
      setFacilities([]);
      setFacilityError(
        "Unable to load nearby emergency facilities. Please try again.",
      );
    } finally {
      setIsLoadingFacilities(false);
    }
  };

  const handleUseMyLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationState("unsupported");

      return;
    }

    setLocationState("requesting");
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        const newCoords: UserCoordinates = {
          lat: latitude,
          lng: longitude,
          accuracy: Math.round(accuracy),
          timestamp: position.timestamp,
        };

        setCoords(newCoords);
        setMapCenter([latitude, longitude]);
        setMapZoom(14);
        setLocationState("found");

        // Fetch nearby emergency facilities for detected user coordinates
        fetchNearbyFacilities(latitude, longitude);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationState("denied");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationState("unavailable");
          setErrorMsg(
            "Position unavailable. Make sure location services are enabled on your device.",
          );
        } else if (error.code === error.TIMEOUT) {
          setLocationState("unavailable");
          setErrorMsg("Location request timed out. Please try again.");
        } else {
          setLocationState("error");
          setErrorMsg(error.message || "Unable to acquire location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLocationState("requesting");
    setErrorMsg(null);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.trim())}`,
      );

      if (res.ok) {
        const results = await res.json();

        if (results && results.length > 0) {
          const first = results[0];
          const newLat = parseFloat(first.lat);
          const newLng = parseFloat(first.lon);

          const newCoords: UserCoordinates = { lat: newLat, lng: newLng };

          setCoords(newCoords);
          setMapCenter([newLat, newLng]);
          setMapZoom(14);
          setLocationState("found");

          // Fetch nearby emergency facilities for searched location coordinates
          fetchNearbyFacilities(newLat, newLng);

          return;
        }
      }
      setLocationState("error");
      setErrorMsg("No matching place found for your search query.");
    } catch {
      setLocationState("error");
      setErrorMsg("Location search failed. Please check network connection.");
    }
  };

  const handleFacilityClick = (facility: EmergencyFacility) => {
    setSelectedFacilityId(facility.id);
    setMapCenter([facility.latitude, facility.longitude]);
  };

  const handleRequestRoute = async (facility: EmergencyFacility) => {
    if (!coords) {
      setErrorMsg(
        "Please acquire your location first using 'Use My Location' or manual search.",
      );

      return;
    }

    setIsLoadingRoute(true);
    setSelectedFacilityId(facility.id);

    try {
      const res = await fetch(
        `/api/emergency/route?originLat=${coords.lat}&originLng=${coords.lng}&destLat=${facility.latitude}&destLng=${facility.longitude}`,
      );
      const data = await res.json();

      if (res.ok && data.success) {
        setActiveRoute({
          facility,
          distanceKm: data.distanceKm,
          durationMinutes: data.durationMinutes,
          coordinates: data.coordinates,
          googleMapsUrl: data.googleMapsUrl,
          osmDirectionsUrl: data.osmDirectionsUrl,
          isFallback: data.isFallback,
        });
        setMapCenter([facility.latitude, facility.longitude]);
      } else {
        setErrorMsg(data.error || "Unable to calculate route right now.");
      }
    } catch {
      setErrorMsg("Network error while requesting route calculation.");
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const handleClearRoute = () => {
    setActiveRoute(null);
  };

  const handleExplainFacility = (facility: EmergencyFacility) => {
    setExplainingFacility(facility);
  };

  return (
    <div className="space-y-4 pb-8 animate-[fadeIn_0.2s_ease-out]">
      {/* Notifications Banner */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 rounded-2xl border p-3.5 text-xs shadow-2xs ${
                n.severity === "High"
                  ? "border-rose-200 bg-rose-50 text-rose-900"
                  : n.severity === "Medium"
                    ? "border-amber-200 bg-amber-50 text-amber-900"
                    : "border-emerald-200 bg-emerald-50 text-emerald-900"
              }`}
            >
              <Bell className="shrink-0 mt-0.5" size={16} />
              <div className="flex-1">
                <span className="font-extrabold uppercase text-[10px] tracking-wider">
                  {n.title}
                </span>
                <p className="mt-0.5 font-medium">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 p-4 sm:p-5 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <ShieldAlert size={22} />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Emergency & Safe Places
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-600 mt-0.5">
              Find your location and view nearby emergency facilities.
            </p>
          </div>
        </div>
      </div>

      {/* Location Controls */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        <LocationControls
          customErrorMsg={errorMsg}
          locationState={locationState}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          onUseMyLocation={handleUseMyLocation}
        />
      </div>

      {/* Step 3 Disaster Selector */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        <DisasterSelector
          selectedDisaster={selectedDisaster}
          onSelectDisaster={setSelectedDisaster}
        />
      </div>

      {/* Active Route Card Overlay */}
      {activeRoute && (
        <RouteCard routeInfo={activeRoute} onClearRoute={handleClearRoute} />
      )}

      {/* Map Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="text-emerald-600" size={18} />
            <h2 className="text-sm font-extrabold text-slate-900">
              Interactive Location Map
            </h2>
          </div>
          {coords && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live GPS Active
            </span>
          )}
        </div>

        {/* Map Component with Facility Markers & Polyline Route */}
        <EmergencyMap
          activeRoute={activeRoute}
          center={mapCenter}
          facilities={facilities}
          height="420px"
          isLoading={isLoadingFacilities || isLoadingRoute}
          selectedFacilityId={selectedFacilityId}
          userLocation={coords}
          zoom={mapZoom}
          onFacilitySelect={handleFacilityClick}
          onRequestRoute={handleRequestRoute}
        />
      </div>

      {/* Coordinates Details Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Crosshair className="text-slate-700" size={18} />
            <h3 className="text-sm font-bold text-slate-900">
              Your Location Coordinates
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            {coords ? "GPS Active" : "Pending GPS"}
          </span>
        </div>

        {coords ? (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Latitude
              </p>
              <p className="text-sm font-mono font-bold text-slate-900 mt-0.5">
                {coords.lat.toFixed(6)}°
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Longitude
              </p>
              <p className="text-sm font-mono font-bold text-slate-900 mt-0.5">
                {coords.lng.toFixed(6)}°
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                GPS Accuracy
              </p>
              <p className="text-sm font-bold text-emerald-700 mt-0.5">
                {coords.accuracy
                  ? `± ${coords.accuracy} meters`
                  : "High Precision"}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-center">
            <p className="text-xs font-semibold text-slate-500">
              Coordinates not acquired yet. Click{" "}
              <strong>Use My Location</strong> to display live GPS data and load
              nearby facilities.
            </p>
          </div>
        )}
      </div>

      {/* Step 3 & 6 Recommended Facilities Section */}
      {coords && facilities.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs">
          <RecommendedFacilities
            facilities={facilities}
            selectedDisaster={selectedDisaster}
            selectedFacilityId={selectedFacilityId}
            onExplainFacility={handleExplainFacility}
            onFacilityClick={handleFacilityClick}
            onRequestRoute={handleRequestRoute}
          />
        </div>
      )}

      {/* Nearby Emergency Facilities Full List */}
      {coords && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs">
          <FacilityList
            errorMsg={facilityError}
            facilities={facilities}
            isLoading={isLoadingFacilities}
            radiusKm={5}
            selectedCategory={selectedCategory}
            selectedDisaster={selectedDisaster}
            selectedFacilityId={selectedFacilityId}
            onCategoryChange={setSelectedCategory}
            onExplainFacility={handleExplainFacility}
            onFacilityClick={handleFacilityClick}
            onRequestRoute={handleRequestRoute}
          />
        </div>
      )}

      {/* AI Explanation Modal Popup */}
      {explainingFacility && (
        <AIExplanationModal
          activeRoute={
            activeRoute?.facility.id === explainingFacility.id
              ? activeRoute
              : null
          }
          disasterType={selectedDisaster}
          facility={explainingFacility}
          hazard={hazardCache[explainingFacility.id] || null}
          userLocation={coords}
          onClose={() => setExplainingFacility(null)}
        />
      )}
    </div>
  );
}
