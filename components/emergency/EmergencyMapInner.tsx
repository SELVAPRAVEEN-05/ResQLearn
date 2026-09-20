"use client";

import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";

import { EmergencyFacility } from "@/app/api/emergency/nearby/route";
import { RouteInfo } from "@/components/emergency/RouteCard";

interface EmergencyMapInnerProps {
  center: [number, number];
  zoom: number;
  userLocation: { lat: number; lng: number } | null;
  facilities?: EmergencyFacility[];
  selectedFacilityId?: string | null;
  activeRoute?: RouteInfo | null;
  onFacilitySelect?: (facility: EmergencyFacility) => void;
  onRequestRoute?: (facility: EmergencyFacility) => void;
  height?: string;
}

function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);

    return `${meters} m away`;
  }

  return `${distanceKm.toFixed(1)} km away`;
}

// User location marker icon
const createUserLocationIcon = () => {
  return L.divIcon({
    className: "custom-user-marker",
    html: `
      <div class="relative flex items-center justify-center">
        <span class="absolute inline-flex h-9 w-9 animate-ping rounded-full bg-emerald-400 opacity-75"></span>
        <div class="relative flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl border-2 border-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="3" fill="currentColor"></circle>
          </svg>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

// Facility marker icon generator based on category type
const createFacilityIcon = (
  type: EmergencyFacility["type"],
  isSelected: boolean,
  isVerified: boolean = false,
) => {
  const size = isSelected ? 42 : 36;
  const anchor = isSelected ? 21 : 18;

  let bgClass = "bg-slate-700";
  let borderClass = isVerified
    ? "border-amber-400 ring-2 ring-amber-300"
    : "border-white";
  let ringClass = isSelected ? "ring-4 ring-slate-400/50 scale-110" : "";
  let iconSvg = "";

  switch (type) {
    case "hospital":
      bgClass = "bg-rose-600";
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6v12"/><path d="M6 12h12"/></svg>`;
      break;
    case "fire_station":
      bgClass = "bg-amber-600";
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`;
      break;
    case "police_station":
      bgClass = "bg-indigo-600";
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>`;
      break;
    case "shelter":
      bgClass = "bg-teal-600";
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
      break;
    default:
      bgClass = "bg-slate-700";
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
      break;
  }

  const starBadgeHtml = isVerified
    ? `<div class="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-slate-950 font-black shadow-md border border-white text-[10px]">⭐</div>`
    : "";

  return L.divIcon({
    className: "custom-facility-marker",
    html: `
      <div class="relative flex items-center justify-center ${ringClass} transition-all duration-200">
        <div class="flex h-9 w-9 items-center justify-center rounded-full ${bgClass} text-white shadow-lg border-2 ${borderClass}">
          ${iconSvg}
        </div>
        ${starBadgeHtml}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [anchor, anchor],
    popupAnchor: [0, -anchor],
  });
};

// Component to dynamically re-center map when location updates
function RecenterMap({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, zoom, {
      duration: 1.2,
    });
  }, [center, zoom, map]);

  return null;
}

export default function EmergencyMapInner({
  center,
  zoom,
  userLocation,
  facilities = [],
  selectedFacilityId,
  activeRoute,
  onFacilitySelect,
  onRequestRoute,
  height = "450px",
}: EmergencyMapInnerProps) {
  const userIcon = createUserLocationIcon();
  const markerRefs = useRef<{ [key: string]: L.Marker | null }>({});

  useEffect(() => {
    if (selectedFacilityId && markerRefs.current[selectedFacilityId]) {
      markerRefs.current[selectedFacilityId]?.openPopup();
    }
  }, [selectedFacilityId]);

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-slate-200 shadow-sm"
      style={{ height }}
    >
      <MapContainer
        center={center}
        className="h-full w-full z-10"
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        zoom={zoom}
      >
        <RecenterMap center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Location Marker */}
        {userLocation && (
          <Marker
            icon={userIcon}
            position={[userLocation.lat, userLocation.lng]}
          >
            <Popup className="custom-popup">
              <div className="p-1 text-center font-sans">
                <p className="text-xs font-bold text-slate-800">
                  📍 Your Location
                </p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Active Emergency Route Polyline */}
        {activeRoute && Array.isArray(activeRoute.coordinates) && activeRoute.coordinates.length > 0 && (
          <Polyline
            positions={activeRoute.coordinates}
            pathOptions={{
              color: "#059669",
              weight: 5,
              opacity: 0.85,
              dashArray: activeRoute.isFallback ? "8, 8" : undefined,
            }}
          />
        )}

        {/* Nearby Emergency Facility Markers */}
        {facilities.map((facility) => {
          const isSelected = selectedFacilityId === facility.id;
          const isVerified = Boolean(facility.isVerified);
          const icon = createFacilityIcon(
            facility.type,
            isSelected,
            isVerified,
          );

          let categoryLabel = "Emergency Facility";
          let badgeColor = "bg-slate-100 text-slate-700";

          if (facility.type === "hospital") {
            categoryLabel = "Hospital";
            badgeColor = "bg-rose-100 text-rose-800 border-rose-200";
          } else if (facility.type === "fire_station") {
            categoryLabel = "Fire Station";
            badgeColor = "bg-amber-100 text-amber-800 border-amber-200";
          } else if (facility.type === "police_station") {
            categoryLabel = "Police Station";
            badgeColor = "bg-indigo-100 text-indigo-800 border-indigo-200";
          } else if (facility.type === "shelter") {
            categoryLabel = "Emergency Shelter";
            badgeColor = "bg-teal-100 text-teal-800 border-teal-200";
          }

          return (
            <Marker
              key={facility.id}
              ref={(ref) => {
                markerRefs.current[facility.id] = ref;
              }}
              eventHandlers={{
                click: () => {
                  if (onFacilitySelect) onFacilitySelect(facility);
                },
              }}
              icon={icon}
              position={[facility.latitude, facility.longitude]}
            >
              <Popup className="custom-popup max-w-xs">
                <div className="p-1.5 space-y-1.5 font-sans">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold border ${badgeColor}`}
                    >
                      {categoryLabel}
                    </span>
                    {isVerified ? (
                      <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                        ✓ Admin Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200">
                        OpenStreetMap mapped facility
                      </span>
                    )}
                    {facility.isAvailable === false && (
                      <span className="inline-flex items-center gap-0.5 rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800 border border-rose-200">
                        ✖ Currently Unavailable
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 mt-1 leading-snug">
                      {facility.name}
                    </h4>
                    <p className="text-[11px] font-bold text-emerald-700 mt-0.5">
                      {formatDistance(facility.distanceKm)}
                    </p>
                  </div>

                  {facility.address && (
                    <p className="text-[11px] text-slate-600 border-t border-slate-100 pt-1">
                      📍 {facility.address}
                    </p>
                  )}

                  <div className="flex items-center justify-between border-t border-slate-100 pt-1.5 gap-2">
                    {facility.phone ? (
                      <a
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline"
                        href={`tel:${facility.phone}`}
                      >
                        📞 Call
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-400">No phone</span>
                    )}

                    {onRequestRoute && (
                      <button
                        className="inline-flex items-center gap-1 rounded-md bg-emerald-600 text-white px-2 py-1 text-[10px] font-bold hover:bg-emerald-700 cursor-pointer shadow-2xs"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRequestRoute(facility);
                        }}
                      >
                        🧭 View Route
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
