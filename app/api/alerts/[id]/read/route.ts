import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ message: "Guest view" });
  }
  const userId = session.id;

  try {
    // Find alert either by alert_id or id
    const alertRes = await query(
      "SELECT id FROM resq_alerts WHERE alert_id = $1 OR id::text = $1",
      [id]
    );

    if (alertRes.rows.length === 0) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    const alertDbId = alertRes.rows[0].id;

    await query(
      `INSERT INTO resq_user_alert_reads (user_id, alert_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, alert_id) DO NOTHING`,
      [userId, alertDbId]
    );

    return NextResponse.json({ message: "Alert marked as read" });
  } catch (error: any) {
    console.error("Mark alert read error:", error);
    return NextResponse.json({ error: "Failed to mark alert as read" }, { status: 500 });
  }
}
