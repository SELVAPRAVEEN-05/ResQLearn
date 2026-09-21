"use client";

import React, { useState } from "react";
import { Shield, MapPin, Crosshair } from "lucide-react";

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
import VerifiedPlacesAdminManager from "@/components/emergency/VerifiedPlacesAdminManager";

// Default map center (Tamil Nadu / Erode region fallback center)
const DEFAULT_CENTER: [number, number] = [11.341, 77.7172];

interface AdminCoordinates {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
}

export default function AdminEmergencyPage() {
  const [locationState, setLocationState] = useState<LocationState>("initial");
  const [coords, setCoords] = useState<AdminCoordinates | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState<number>(12);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Step 3 Disaster Selector State
  const [selectedDisaster, setSelectedDisaster] =
    useState<DisasterType>("general");

  // Step 2 & 4 Emergency Facilities State (OSM + NeonDB Verified)
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

  // Step 7 AI Explanation Modal State
  const [explainingFacility, setExplainingFacility] =
    useState<EmergencyFacility | null>(null);

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

        const newCoords: AdminCoordinates = {
          lat: latitude,
          lng: longitude,
          accuracy: Math.round(accuracy),
          timestamp: position.timestamp,
        };

        setCoords(newCoords);
        setMapCenter([latitude, longitude]);
        setMapZoom(14);
        setLocationState("found");

        // Fetch nearby emergency facilities for detected admin coordinates
        fetchNearbyFacilities(latitude, longitude);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationState("denied");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationState("unavailable");
          setErrorMsg(
            "Position unavailable. Make sure location services are active.",
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

          const newCoords: AdminCoordinates = { lat: newLat, lng: newLng };

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
        "Please acquire admin location baseline first using 'Use My Location' or search.",
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
    <div className="space-y-6 pb-8 animate-[fadeIn_0.2s_ease-out]">
      {/* Admin Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-sm font-black">
              <Shield size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Emergency Location Map
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
                View and manage emergency locations.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 self-start sm:self-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Disaster-Aware Command Active
          </span>
        </div>
      </div>

      {/* Location Controls */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
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
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
        <DisasterSelector
          selectedDisaster={selectedDisaster}
          onSelectDisaster={setSelectedDisaster}
        />
      </div>

      {/* Active Route Card Overlay */}
      {activeRoute && (
        <RouteCard routeInfo={activeRoute} onClearRoute={handleClearRoute} />
      )}

      {/* Command Map */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="text-emerald-600" size={20} />
            <h2 className="text-base font-extrabold text-slate-900">
              Geospatial Command Map
            </h2>
          </div>
          {coords && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Admin Marker
            </span>
          )}
        </div>

        <EmergencyMap
          activeRoute={activeRoute}
          center={mapCenter}
          facilities={facilities}
          height="min(62vh, 500px)"
          isLoading={isLoadingFacilities || isLoadingRoute}
          selectedFacilityId={selectedFacilityId}
          userLocation={coords}
          zoom={mapZoom}
          onFacilitySelect={handleFacilityClick}
          onRequestRoute={handleRequestRoute}
        />
      </div>

      {/* Coordinates Overview */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Crosshair className="text-slate-700" size={18} />
          <h3 className="text-sm font-bold text-slate-900">
            Current Position Benchmark
          </h3>
        </div>

        {coords ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Latitude
              </p>
              <p className="text-base font-mono font-bold text-slate-900 mt-1">
                {coords.lat.toFixed(6)}°
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Longitude
              </p>
              <p className="text-base font-mono font-bold text-slate-900 mt-1">
                {coords.lng.toFixed(6)}°
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Accuracy Radius
              </p>
              <p className="text-base font-bold text-emerald-700 mt-1">
                {coords.accuracy
                  ? `± ${coords.accuracy} meters`
                  : "High Precision"}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-5 text-center">
            <p className="text-xs font-semibold text-slate-500">
              No live location acquired. Click <strong>Use My Location</strong>{" "}
              to display coordinates and nearby facilities on the admin map.
            </p>
          </div>
        )}
      </div>

      {/* Step 3 Admin Recommended Facilities Section */}
      {coords && facilities.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
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

      {/* Step 4 Verified Places Database Management */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
        <VerifiedPlacesAdminManager
          onRefreshMap={() => {
            if (coords) {
              fetchNearbyFacilities(coords.lat, coords.lng);
            }
          }}
        />
      </div>

      {/* Facility Management Overview */}
      {coords && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
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
          userLocation={coords}
          onClose={() => setExplainingFacility(null)}
        />
      )}
    </div>
  );
}
