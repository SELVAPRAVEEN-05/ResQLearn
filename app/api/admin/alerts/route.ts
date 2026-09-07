import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const alertsRes = await query("SELECT * FROM resq_alerts ORDER BY created_at DESC");
    return NextResponse.json({ alerts: alertsRes.rows });
  } catch (error: any) {
    console.error("Admin alerts error:", error);
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, message, severity } = body;

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required." }, { status: 400 });
    }

    const alertId = `a_${Date.now()}`;
    const result = await query(
      `INSERT INTO resq_alerts (alert_id, title, message, severity, is_active)
       VALUES ($1, $2, $3, $4, TRUE)
       RETURNING *`,
      [alertId, title, message, severity || "Medium"]
    );

    return NextResponse.json({ message: "Alert broadcasted", alert: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error("Create alert error:", error);
    return NextResponse.json({ error: "Failed to broadcast alert" }, { status: 500 });
  }
}
