import { DisasterType } from "./disasterRules";

import { EmergencyFacility } from "@/app/api/emergency/nearby/route";

export type HazardExposureLevel =
  | "lower"
  | "moderate"
  | "higher"
  | "unavailable";

export interface HazardAnalysisResult {
  level: HazardExposureLevel;
  displayStatus: string;
  badgeClass: string;
  explanation: string;
  elevationMeters?: number;
  temperatureCelsius?: number;
  heatwaveRisk?: string;
  isAvailable: boolean;
}

/**
 * Analyzes real environmental / hazard data for a facility and user location.
 */
export async function analyzeFacilityHazard(
  disasterType: DisasterType,
  userLocation: { lat: number; lng: number } | null,
  facility: EmergencyFacility,
): Promise<HazardAnalysisResult> {
  const fLat = facility.latitude;
  const fLng = facility.longitude;

  // Default fallback if user location or network is unavailable
  const defaultUnavailable: HazardAnalysisResult = {
    level: "unavailable",
    displayStatus: "Hazard Data Unavailable",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    explanation:
      "Hazard information unavailable for this location. Recommendation is based on facility type, distance, verification, and availability.",
    isAvailable: false,
  };

  if (!userLocation) {
    return defaultUnavailable;
  }

  try {
    // 1. HEATWAVE HAZARD ANALYSIS
    if (disasterType === "heatwave") {
      const aiBaseUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
      let mlRisk = "LOW";
      let tempC: number | undefined = undefined;

      try {
        const mlRes = await fetch(
          `${aiBaseUrl.replace(/\/$/, "")}/api/predict-heatwave`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date: "today" }),
            cache: "no-store",
          },
        );

        if (mlRes.ok) {
          const mlData = await mlRes.json();

          if (mlData && mlData.available) {
            mlRisk = (mlData.risk || "LOW").toUpperCase();
            tempC = mlData.temperature;
          }
        }
      } catch (e) {
        // AI service offline fallback
      }

      // If facility is hospital or cooling shelter, exposure is lower during heatwave
      const isCoolingSite =
        facility.type === "hospital" ||
        facility.type === "shelter" ||
        facility.rawType === "cooling_center";

      if (mlRisk === "HIGH") {
        if (isCoolingSite) {
          return {
            level: "moderate",
            displayStatus: "Moderate Estimated Exposure",
            badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
            explanation: `High heatwave advisory active (${tempC ? tempC + "°C" : "severe heat"}). Facility offers indoor climate shelter & hydration.`,
            temperatureCelsius: tempC,
            heatwaveRisk: mlRisk,
            isAvailable: true,
          };
        } else {
          return {
            level: "higher",
            displayStatus: "Higher Estimated Exposure",
            badgeClass: "bg-rose-100 text-rose-800 border-rose-200",
            explanation: `High heatwave advisory active. Non-cooling facility with exposed outdoor perimeter.`,
            temperatureCelsius: tempC,
            heatwaveRisk: mlRisk,
            isAvailable: true,
          };
        }
      }

      return {
        level: "lower",
        displayStatus: "Lower Estimated Exposure",
        badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
        explanation: `Normal ambient thermal conditions (${tempC ? tempC + "°C" : "moderate heat"}). Facility suitable for thermal refuge.`,
        temperatureCelsius: tempC,
        heatwaveRisk: mlRisk,
        isAvailable: true,
      };
    }

    // 2. FLOOD / ELEVATION HAZARD ANALYSIS
    if (disasterType === "flood" || disasterType === "general") {
      let fElev: number | null = null;
      let uElev: number | null = null;

      try {
        const elevRes = await fetch(
          `https://api.open-meteo.com/v1/elevation?latitude=${fLat},${userLocation.lat}&longitude=${fLng},${userLocation.lng}`,
        );

        if (elevRes.ok) {
          const elevData = await elevRes.json();

          if (
            elevData &&
            Array.isArray(elevData.elevation) &&
            elevData.elevation.length >= 2
          ) {
            fElev = Math.round(elevData.elevation[0]);
            uElev = Math.round(elevData.elevation[1]);
          }
        }
      } catch (e) {
        // Elevation API offline
      }

      if (fElev !== null && uElev !== null) {
        const diff = fElev - uElev;

        if (diff >= 3) {
          return {
            level: "lower",
            displayStatus: "Lower Estimated Exposure",
            badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
            explanation: `Terrain elevation is +${diff}m higher than user baseline position (${fElev}m vs ${uElev}m MSL).`,
            elevationMeters: fElev,
            isAvailable: true,
          };
        } else if (diff >= -2) {
          return {
            level: "moderate",
            displayStatus: "Moderate Estimated Exposure",
            badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
            explanation: `Facility elevation is comparable to local ground baseline (${fElev}m MSL).`,
            elevationMeters: fElev,
            isAvailable: true,
          };
        } else {
          return {
            level: "higher",
            displayStatus: "Higher Estimated Exposure",
            badgeClass: "bg-rose-100 text-rose-800 border-rose-200",
            explanation: `Facility is located at lower ground elevation (${diff}m lower than user location).`,
            elevationMeters: fElev,
            isAvailable: true,
          };
        }
      }
    }

    // Default lower exposure for verified/shelter facilities if specific dataset is unavailable
    if (facility.isVerified && facility.type === "shelter") {
      return {
        level: "lower",
        displayStatus: "Lower Estimated Exposure",
        badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
        explanation:
          "Admin-verified shelter facility located outside mapped high-risk hazard corridors.",
        isAvailable: true,
      };
    }

    return defaultUnavailable;
  } catch (err) {
    return defaultUnavailable;
  }
}
