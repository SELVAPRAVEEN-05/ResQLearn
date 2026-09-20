import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  const authResult = await requireAdmin();

  if ("errorResponse" in authResult) {
    return authResult.errorResponse;
  }

  try {
    const result = await query(
      `SELECT id, name, type, latitude, longitude, address, phone, disaster_types, capacity, verified, available, source, created_at, updated_at
       FROM resq_emergency_places
       ORDER BY id DESC`,
    );

    return NextResponse.json({
      success: true,
      places: result.rows || [],
    });
  } catch (error: any) {
    console.error("GET /api/admin/emergency-places error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch verified emergency places." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const authResult = await requireAdmin();

  if ("errorResponse" in authResult) {
    return authResult.errorResponse;
  }

  try {
    const body = await request.json();
    const {
      name,
      type,
      latitude,
      longitude,
      address,
      phone,
      disaster_types,
      capacity,
      available = true,
      source = "admin",
    } = body;

    // Server-side validation
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Facility name is required." },
        { status: 400 },
      );
    }

    const validTypes = [
      "hospital",
      "fire_station",
      "police_station",
      "police",
      "shelter",
      "cooling_center",
      "emergency_center",
      "other",
    ];

    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: "Invalid facility type provided." },
        { status: 400 },
      );
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      return NextResponse.json(
        {
          success: false,
          error: "Latitude must be between -90 and 90 degrees.",
        },
        { status: 400 },
      );
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      return NextResponse.json(
        {
          success: false,
          error: "Longitude must be between -180 and 180 degrees.",
        },
        { status: 400 },
      );
    }

    const parsedCapacity = capacity ? parseInt(capacity, 10) : null;
    const parsedDisasterTypes =
      Array.isArray(disaster_types) && disaster_types.length > 0
        ? disaster_types
        : ["General Emergency"];

    // Admin created records are automatically marked verified = true
    const insertQuery = `
      INSERT INTO resq_emergency_places
        (name, type, latitude, longitude, address, phone, disaster_types, capacity, verified, available, source)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    const params = [
      name.trim(),
      type,
      lat,
      lng,
      address?.trim() || null,
      phone?.trim() || null,
      parsedDisasterTypes,
      parsedCapacity,
      true, // verified = true
      Boolean(available),
      source,
    ];

    const result = await query(insertQuery, params);
    const createdPlace = result.rows[0];

    return NextResponse.json(
      {
        success: true,
        message: "Emergency place added successfully and marked as verified.",
        place: createdPlace,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("POST /api/admin/emergency-places error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to create emergency place." },
      { status: 500 },
    );
  }
}
