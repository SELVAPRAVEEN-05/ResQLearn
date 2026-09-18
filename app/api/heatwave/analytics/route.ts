import { NextResponse } from "next/server";

export async function GET() {
  const aiBaseUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
  const targetEndpoint = `${aiBaseUrl.replace(/\/$/, "")}/api/heatwave/analytics`;

  try {
    const aiResponse = await fetch(targetEndpoint, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    const data = await aiResponse.json();

    if (!aiResponse.ok) {
      return NextResponse.json(
        {
          error:
            data?.detail ||
            data?.error ||
            "Heatwave analytics service returned an error.",
        },
        { status: aiResponse.status },
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error(
      "Failed to connect to Heatwave analytics service at:",
      targetEndpoint,
      err,
    );

    return NextResponse.json(
      {
        error: "Heatwave analytics service is currently unavailable.",
        code: "AI_SERVICE_UNAVAILABLE",
      },
      { status: 503 },
    );
  }
}
