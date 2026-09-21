import { NextResponse } from "next/server";

import { query } from "@/lib/db";
import { activeAlertCondition } from "@/lib/notifications";

export interface EmergencyNotification {
  id: string;
  title: string;
  message: string;
  severity: "High" | "Medium" | "Low";
  category: "heatwave" | "facility" | "general";
  timestamp: string;
  expiresAt?: string | null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const disasterType = searchParams.get("disaster") || "general";

    const notifications: EmergencyNotification[] = [];

    // Include the same active admin broadcasts shown in the global notification system.
    try {
      const alertResult = await query(
        `SELECT a.alert_id, a.title, a.message, a.severity, a.created_at, a.expires_at
         FROM resq_alerts a
         WHERE ${activeAlertCondition()}
         ORDER BY a.created_at DESC
         LIMIT 10`,
      );

      for (const alert of alertResult.rows) {
        notifications.push({
          id: `admin_alert_${alert.alert_id}`,
          title: alert.title,
          message: alert.message,
          severity: alert.severity,
          category: "general",
          timestamp: new Date(alert.created_at).toISOString(),
          expiresAt: alert.expires_at
            ? new Date(alert.expires_at).toISOString()
            : null,
        });
      }
    } catch {
      // The emergency feed still serves live AI and facility notifications if the alert store is unavailable.
    }

    // 1. Heatwave Risk Alert check from AI service
    if (disasterType === "heatwave" || disasterType === "general") {
      const aiBaseUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";

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
            const risk = (mlData.risk || "LOW").toUpperCase();

            if (risk === "HIGH" || risk === "MODERATE" || risk === "MEDIUM") {
              const expiresAt = new Date(
                `${mlData.date || new Date().toISOString().slice(0, 10)}T23:59:59+05:30`,
              );

              if (expiresAt > new Date()) {
                notifications.push({
                  id: `heatwave_${mlData.date || "today"}_${risk}`,
                  title: "Elevated Heatwave Advisory",
                  message: `Heatwave risk level: ${risk} (${mlData.temperature || 38}°C). Check Emergency Map for climate-controlled cooling shelters.`,
                  severity: risk === "HIGH" ? "High" : "Medium",
                  category: "heatwave",
                  timestamp: new Date().toISOString(),
                  expiresAt: expiresAt.toISOString(),
                });
              }
            }
          }
        }
      } catch {
        // Fallback
      }
    }

    // 2. Verified Facilities Update alert from DB
    try {
      const dbResult = await query(
        `SELECT id, name, type, updated_at
         FROM resq_emergency_places
         WHERE verified = true
         ORDER BY updated_at DESC
         LIMIT 2`,
      );

      if (dbResult.rows && dbResult.rows.length > 0) {
        const latest = dbResult.rows[0];

        notifications.push({
          id: `facility_verified_${latest.id}`,
          title: "Verified Emergency Facility Operational",
          message: `"${latest.name}" is verified and active in the emergency database.`,
          severity: "Low",
          category: "facility",
          timestamp: latest.updated_at
            ? new Date(latest.updated_at).toISOString()
            : new Date().toISOString(),
        });
      }
    } catch {
      // Fallback
    }

    // Default general advisory if no high severity notification exists
    if (notifications.length === 0) {
      notifications.push({
        id: "general_advisory_2026",
        title: "Disaster Preparedness System Active",
        message:
          "Select your current emergency type to view prioritized facilities and hazard assessments.",
        severity: "Low",
        category: "general",
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      notifications,
    });
  } catch (error: any) {
    console.error("GET /api/emergency/notifications error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications." },
      { status: 500 },
    );
  }
}
