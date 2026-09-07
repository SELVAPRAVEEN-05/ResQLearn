import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  const session = await getSessionUser();
  const userId = session ? session.id : 0;

  try {
    const alertsRes = await query(
      `SELECT a.id, a.alert_id, a.title, a.message, a.severity, a.created_at as date,
              CASE WHEN r.user_id IS NOT NULL THEN TRUE ELSE FALSE END as read
       FROM resq_alerts a
       LEFT JOIN resq_user_alert_reads r ON a.id = r.alert_id AND r.user_id = $1
       WHERE a.is_active = TRUE
       ORDER BY a.created_at DESC`,
      [userId]
    );

    return NextResponse.json({
      alerts: alertsRes.rows.map((a) => ({
        id: a.alert_id || a.id.toString(),
        numericId: a.id,
        title: a.title,
        message: a.message,
        severity: a.severity,
        date: a.date,
        read: a.read,
      })),
    });
  } catch (error: any) {
    console.error("Alerts error:", error);
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}
