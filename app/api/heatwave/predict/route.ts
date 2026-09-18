import { NextRequest, NextResponse } from "next/server";

import { query } from "@/lib/db";

export async function POST(request: NextRequest) {
  let body: { date?: string };

  // 1. Parse JSON request body
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 },
    );
  }

  // 2. Validate input date parameter
  const dateStr = body?.date?.toString().trim();

  if (!dateStr) {
    return NextResponse.json(
      { error: "Missing 'date' parameter in request payload." },
      { status: 400 },
    );
  }

  // 3. Resolve Python AI Microservice URL from environment
  const aiBaseUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
  const targetEndpoint = `${aiBaseUrl.replace(/\/$/, "")}/api/predict-heatwave`;

  // 4. Forward request to Python FastAPI Heatwave Service
  try {
    const aiResponse = await fetch(targetEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ date: dateStr }),
      cache: "no-store",
    });

    const data = await aiResponse.json();

    if (!aiResponse.ok) {
      return NextResponse.json(
        {
          error:
            data?.detail ||
            data?.error ||
            "AI heatwave service returned an error response.",
        },
        { status: aiResponse.status },
      );
    }

    // 5. Backend Risk Detection & Automatic Notification Generation
    if (data && data.available && data.risk) {
      const riskUpper = data.risk.toString().toUpperCase();

      if (
        riskUpper === "HIGH" ||
        riskUpper === "MODERATE" ||
        riskUpper === "MEDIUM"
      ) {
        const dateKey = data.date || dateStr;
        const alertId = `heatwave_erode_${dateKey}_${riskUpper.toLowerCase()}`;
        const locationStr = data.location || "Erode, Tamil Nadu";
        const title = `Heatwave Risk Alert: ${data.risk} Risk in ${locationStr.split(",")[0]}`;
        const severity = riskUpper === "HIGH" ? "High" : "Medium";
        const tempStr =
          data.temperature != null ? `${data.temperature}°C` : "N/A";
        const dateDisplay = data.formatted_date || data.date || dateStr;

        const message = `${locationStr.split(",")[0]} — ${dateDisplay}\nTemperature: ${tempStr}\nRisk: ${data.risk}${
          data.prediction ? `\n\n${data.prediction}` : ""
        }${data.explanation ? `\n\n${data.explanation}` : ""}`;

        try {
          await query(
            `INSERT INTO resq_alerts (alert_id, title, message, severity, is_active)
             VALUES ($1, $2, $3, $4, TRUE)
             ON CONFLICT (alert_id) DO NOTHING`,
            [alertId, title, message, severity],
          );
        } catch (dbErr) {
          console.error("Error creating automated heatwave risk alert:", dbErr);
        }
      }
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    console.error(
      "Failed to connect to Heatwave AI service at:",
      targetEndpoint,
      err,
    );

    return NextResponse.json(
      {
        error:
          "Heatwave AI service is currently unavailable. Please ensure the Python backend server is running on port 8000.",
        code: "AI_SERVICE_UNAVAILABLE",
      },
      { status: 503 },
    );
  }
}
