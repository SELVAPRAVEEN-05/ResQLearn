import { NextResponse } from "next/server";

const MANDATORY_DISCLAIMER =
  "Emergency information can change quickly. Follow instructions from local emergency authorities and emergency services.";

function generateFallbackExplanation(body: any): string {
  const { disasterType, facility, hazard, route } = body || {};
  const facilityName = facility?.name || "this emergency facility";
  const facilityType = (facility?.type || "facility").replace("_", " ");
  const dist = route?.distanceKm || facility?.distanceKm || "nearby";
  const duration = route?.durationMinutes
    ? `${route.durationMinutes} min`
    : null;
  const isVerified = facility?.isVerified;
  const isAvailable = facility?.isAvailable !== false;

  const verifiedStr = isVerified
    ? "It is marked as an Admin Verified facility in our trusted emergency database."
    : "It is an OpenStreetMap mapped public facility.";

  const availabilityStr = isAvailable
    ? "It is currently marked as available for emergency response."
    : "Note: It is currently marked as unavailable; please verify before proceeding.";

  const hazardStr = hazard?.explanation
    ? `Hazard exposure estimate: ${hazard.displayStatus || "evaluated"}. (${hazard.explanation})`
    : "Hazard exposure assessment is based on proximity and facility category.";

  const routeStr = duration
    ? `The estimated road route distance is ${dist} km with an ETA of approximately ${duration}.`
    : `The straight-line proximity distance is approximately ${dist} km.`;

  return `### Why ${facilityName}?

- **Role & Category**: This facility operates as an **${facilityType}** appropriate for **${disasterType || "emergency"}** response. ${verifiedStr}
- **Availability & Status**: ${availabilityStr}
- **Route & Proximity**: ${routeStr}
- **Environmental Hazard Exposure**: ${hazardStr}

> ⚠️ **Notice**: ${MANDATORY_DISCLAIMER}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { disasterType, facility, hazard, route } = body;

    if (!facility || !facility.name) {
      return NextResponse.json(
        { success: false, error: "Facility details are required." },
        { status: 400 },
      );
    }

    let explanationText = "";
    let source = "SafeGraph AI Knowledge Engine";

    // 1. Check if GEMINI_API_KEY is available for server-side AI explanation
    if (process.env.GEMINI_API_KEY) {
      try {
        const systemPrompt = `You are SafeGraph AI, an authoritative disaster preparedness assistant explaining why an emergency facility is recommended.
CRITICAL RULES:
1. Explain strictly using ONLY the structured facts supplied in the input JSON below.
2. DO NOT invent fake availability, phone numbers, safety percentages, or physical safety guarantees. Never say "guaranteed safe" or "100% safe".
3. Use transparent terms like "Admin Verified", "Lower Estimated Exposure", or "Recommended based on available data".
4. Include clean markdown bullet points explaining: Facility type relevance, verification, availability, route distance/ETA, and hazard exposure.
5. End with this EXACT disclaimer string: "${MANDATORY_DISCLAIMER}"

STRUCTURED INPUT DATA:
${JSON.stringify({ disasterType, facility, hazard, route }, null, 2)}`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: systemPrompt }] }],
            }),
          },
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const candidate =
            geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

          if (candidate) {
            explanationText = candidate;
            source = "Gemini 1.5 Flash AI Engine & Knowledge Graph";
          }
        }
      } catch (err: any) {
        console.warn(
          "Gemini API call failed, using deterministic explanation fallback:",
          err.message,
        );
      }
    }

    // 2. Fallback Explanation Engine if Gemini API key is missing or request failed
    if (!explanationText) {
      explanationText = generateFallbackExplanation(body);
    }

    return NextResponse.json({
      success: true,
      explanation: explanationText,
      source,
      disclaimer: MANDATORY_DISCLAIMER,
    });
  } catch (error: any) {
    console.error("POST /api/emergency/explain error:", error);

    return NextResponse.json(
      {
        success: false,
        explanation: generateFallbackExplanation(null),
        source: "SafeGraph Knowledge Graph Fallback Engine",
        disclaimer: MANDATORY_DISCLAIMER,
      },
      { status: 500 },
    );
  }
}
