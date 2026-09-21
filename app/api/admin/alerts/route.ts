import { NextResponse } from "next/server";

import { ensureSchema, query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { activeAlertCondition } from "@/lib/notifications";

export async function GET() {
  const auth = await requireAdmin();
  if ("errorResponse" in auth) return auth.errorResponse;

  try {
    const alertsRes = await query(
      `SELECT a.* FROM resq_alerts a WHERE ${activeAlertCondition()} ORDER BY a.created_at DESC`,
    );

    return NextResponse.json({ alerts: alertsRes.rows });
  } catch (error: any) {
    console.error("Admin alerts error:", error);

    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("errorResponse" in auth) return auth.errorResponse;

  try {
    await ensureSchema();

    const body = await request.json();
    const { title, message, severity, expiresAt } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: "Title and message are required." },
        { status: 400 },
      );
    }

    const parsedExpiresAt = expiresAt ? new Date(expiresAt) : null;
    if (expiresAt && Number.isNaN(parsedExpiresAt?.getTime())) {
      return NextResponse.json(
        { error: "expiresAt must be a valid timestamp." },
        { status: 400 },
      );
    }

    const alertId = `a_${Date.now()}`;
    const result = await query(
      `INSERT INTO resq_alerts (alert_id, title, message, severity, is_active, expires_at)
       VALUES ($1, $2, $3, $4, TRUE, $5)
       RETURNING *`,
      [alertId, title, message, severity || "Medium", parsedExpiresAt],
    );

    return NextResponse.json(
      { message: "Alert broadcasted", alert: result.rows[0] },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Create alert error:", error);

    return NextResponse.json(
      { error: "Failed to broadcast alert" },
      { status: 500 },
    );
  }
}
