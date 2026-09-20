import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { query } from "@/lib/db";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAdmin();

  if ("errorResponse" in authResult) {
    return authResult.errorResponse;
  }

  try {
    const rawParams = await (context.params as any);
    const id = parseInt(rawParams.id, 10);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid emergency place ID." },
        { status: 400 },
      );
    }

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
      verified,
      available,
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

    const parsedCapacity =
      capacity !== null && capacity !== undefined
        ? parseInt(capacity, 10)
        : null;
    const parsedDisasterTypes =
      Array.isArray(disaster_types) && disaster_types.length > 0
        ? disaster_types
        : ["General Emergency"];

    const updateQuery = `
      UPDATE resq_emergency_places
      SET
        name = $1,
        type = $2,
        latitude = $3,
        longitude = $4,
        address = $5,
        phone = $6,
        disaster_types = $7,
        capacity = $8,
        verified = $9,
        available = $10,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
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
      verified !== undefined ? Boolean(verified) : true,
      available !== undefined ? Boolean(available) : true,
      id,
    ];

    const result = await query(updateQuery, params);

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: "Emergency place record not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Emergency place updated successfully.",
      place: result.rows[0],
    });
  } catch (error: any) {
    console.error("PUT /api/admin/emergency-places/[id] error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to update emergency place." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAdmin();

  if ("errorResponse" in authResult) {
    return authResult.errorResponse;
  }

  try {
    const rawParams = await (context.params as any);
    const id = parseInt(rawParams.id, 10);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid emergency place ID." },
        { status: 400 },
      );
    }

    const result = await query(
      `DELETE FROM resq_emergency_places WHERE id = $1 RETURNING id`,
      [id],
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: "Emergency place record not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Emergency place record deleted successfully.",
    });
  } catch (error: any) {
    console.error("DELETE /api/admin/emergency-places/[id] error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to delete emergency place." },
      { status: 500 },
    );
  }
}
