import { NextResponse } from "next/server";

import { query } from "@/lib/db";
import { EmergencyFacility } from "@/app/api/emergency/nearby/route";

function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get("lat");
    const lngStr = searchParams.get("lng");

    const userLat = latStr ? parseFloat(latStr) : null;
    const userLng = lngStr ? parseFloat(lngStr) : null;

    // Fetch verified places from database
    const dbResult = await query(
      `SELECT id, name, type, latitude, longitude, address, phone, disaster_types, capacity, verified, available, source, updated_at
       FROM resq_emergency_places
       WHERE verified = true
       ORDER BY id DESC`,
    );

    const rows = dbResult.rows || [];

    const facilities: EmergencyFacility[] = rows.map((row: any) => {
      const fLat = parseFloat(row.latitude);
      const fLng = parseFloat(row.longitude);

      let distanceKm = 0;

      if (
        userLat !== null &&
        userLng !== null &&
        !isNaN(userLat) &&
        !isNaN(userLng)
      ) {
        distanceKm = calculateHaversineDistance(userLat, userLng, fLat, fLng);
      }

      // Standardize type mapping
      let type: EmergencyFacility["type"] = "other";
      const rawType = String(row.type).toLowerCase();

      if (rawType.includes("hospital") || rawType.includes("clinic")) {
        type = "hospital";
      } else if (rawType.includes("fire")) {
        type = "fire_station";
      } else if (rawType.includes("police")) {
        type = "police_station";
      } else if (rawType.includes("shelter") || rawType.includes("cooling")) {
        type = "shelter";
      } else {
        type = "other";
      }

      return {
        id: `db_${row.id}`,
        name: row.name,
        type,
        latitude: fLat,
        longitude: fLng,
        address: row.address || undefined,
        phone: row.phone || undefined,
        distanceKm,
        isVerified: true,
        isAvailable: row.available !== false,
        disasterTypes: Array.isArray(row.disaster_types)
          ? row.disaster_types
          : ["General Emergency"],
        capacity: row.capacity ? parseInt(row.capacity, 10) : undefined,
        source: row.source || "admin",
        updatedAt: row.updated_at
          ? new Date(row.updated_at).toISOString()
          : undefined,
      };
    });

    if (userLat !== null && userLng !== null) {
      facilities.sort((a, b) => a.distanceKm - b.distanceKm);
    }

    return NextResponse.json({
      success: true,
      count: facilities.length,
      facilities,
    });
  } catch (error: any) {
    console.error("GET /api/emergency/verified error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load verified emergency facilities.",
        facilities: [],
      },
      { status: 500 },
    );
  }
}
