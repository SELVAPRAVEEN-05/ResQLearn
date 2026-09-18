import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { query } from "@/lib/db";

// Helper to fetch authoritative Heatwave ML prediction from Python API
async function fetchHeatwavePrediction(userQuery: string) {
  const q = userQuery.toLowerCase();
  const isHeatwaveRelated =
    q.includes("heatwave") ||
    q.includes("heat wave") ||
    q.includes("temperature") ||
    q.includes("hot weather") ||
    q.includes("sunstroke") ||
    q.includes("heatstroke") ||
    q.includes("erode risk") ||
    q.includes("outside today") ||
    q.includes("outside tomorrow");

  if (!isHeatwaveRelated) return null;

  let targetDate = "today";
  const isoMatch = q.match(/\b(\d{4}[-/.]\d{1,2}[-/.]\d{1,2})\b/);
  const dmyMatch = q.match(/\b(\d{1,2}[-/.]\d{1,2}[-/.]\d{4})\b/);
  const textDateMatch = q.match(
    /\b(\d{1,2}\s+(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\s+\d{4})\b/i,
  );

  if (q.includes("tomorrow")) {
    targetDate = "tomorrow";
  } else if (isoMatch) {
    targetDate = isoMatch[1];
  } else if (dmyMatch) {
    targetDate = dmyMatch[1];
  } else if (textDateMatch) {
    targetDate = textDateMatch[1];
  }

  const aiBaseUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";

  try {
    const res = await fetch(
      `${aiBaseUrl.replace(/\/$/, "")}/api/predict-heatwave`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: targetDate }),
        cache: "no-store",
      },
    );

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Assistant proxy to heatwave AI service error:", err);
  }

  return null;
}

// Grounded Heatwave Knowledge Response Generator
function generateGroundedHeatwaveResponse(prediction: any): string {
  if (!prediction || !prediction.available) {
    return `🔥 **Heatwave Advisory & Safety Guidance**:
- ${prediction?.explanation || "Weather forecast is unavailable for the requested date."}
- **General Heat Safety**: Drink plenty of clean water, ORS, or buttermilk at regular intervals. Avoid direct outdoor sun between 11:00 AM - 3:30 PM.
- **Emergency Contacts**: Call **108** for medical ambulance or Erode District Control Room at **1077**.`;
  }

  const risk = (prediction.risk || "Low").toUpperCase();
  const temp =
    prediction.temperature != null ? `${prediction.temperature}°C` : "N/A";
  const dateStr =
    prediction.formatted_date || prediction.date || "Requested Date";
  const prob =
    prediction.probability != null
      ? `${(prediction.probability * 100).toFixed(1)}%`
      : "N/A";
  const location = prediction.location || "Erode";

  const riskEmoji =
    risk === "HIGH"
      ? "🔴"
      : risk === "MODERATE" || risk === "MEDIUM"
        ? "🟠"
        : "🟢";

  return `🔥 **Heatwave Prediction & Preparedness Analysis**:

📍 **Location**: ${location}
📅 **Target Date**: ${dateStr} (${(prediction.date_type || "FORECAST").toUpperCase()})
🌡️ **Temperature**: **${temp}**
${riskEmoji} **Heatwave Risk Level**: **${risk} RISK** (Model Probability: **${prob}**)

💡 **ML Model Verdict**:
${prediction.prediction || "Model analysis complete."}

🛡️ **Recommended Safety Precautions**:
1. **Hydration**: Drink water, ORS, or tender coconut water every 30-45 minutes even if you don't feel thirsty.
2. **Avoid Peak Heat**: Limit outdoor physical activity between 11:00 AM and 3:30 PM.
3. **Clothing**: Wear light-colored, breathable cotton clothing and use umbrellas or hats when stepping outside.
4. **Emergency Support**: Call **108** for emergency ambulance assistance or Erode District Control Room at **1077**.

*Data Source: ${prediction.source || "Open-Meteo Forecast + SafeGraph AI Heatwave Model"}*`;
}

// Built-in Knowledge Graph Disaster Response Engine
function generateKnowledgeGraphResponse(userQuery: string): string {
  const q = userQuery.toLowerCase();

  if (
    q.includes("flood") ||
    q.includes("water") ||
    q.includes("rain") ||
    q.includes("drown")
  ) {
    return `🌊 **Flood Preparedness & Safety Protocol (SafeGraph Verified)**:
1. **Turn Around, Don't Drown**: Never walk, swim, or drive through flood waters. Just 6 inches of moving water can knock an adult down, and 12-24 inches can carry away cars and SUVs.
2. **Move to High Ground**: Evacuate low-lying areas or ground floors immediately. If trapped in a building, move to the highest floor (avoid sealed attics without roof exits).
3. **Utilities**: Switch off main electrical circuit breakers and gas valves before floodwaters enter if safe to do so.
4. **Emergency Kit**: Ensure you have 3 days of potable water (1 gallon/person/day), waterproof document pouch, and emergency communications ready.`;
  }

  if (
    q.includes("earthquake") ||
    q.includes("tremor") ||
    q.includes("shake") ||
    q.includes("ground")
  ) {
    return `⚡ **Earthquake Safety Protocol (Drop, Cover, and Hold On)**:
1. **DROP**: Drop to your hands and knees immediately to prevent being knocked over.
2. **COVER**: Cover your head and neck under a sturdy table or desk. If no shelter is nearby, drop next to an interior wall and cover your head with your arms.
3. **HOLD ON**: Hold on to your shelter until the shaking stops. Be prepared for the shelter to shift.
4. **DO NOT**: Do not run outside during shaking, do not stand under doorways (modern doorways are not load-bearing safety zones), and never use elevators.`;
  }

  if (
    q.includes("fire") ||
    q.includes("smoke") ||
    q.includes("flame") ||
    q.includes("burn")
  ) {
    return `🔥 **Fire Safety & Evacuation Guidance**:
1. **Evacuate Immediately**: If you hear a smoke alarm or spot a fire, leave immediately via the nearest secondary escape route.
2. **Crawl Low Under Smoke**: Smoke and toxic gases rise. Stay low on hands and knees where air is cooler and cleaner.
3. **Stop, Drop, and Roll**: If your clothes catch fire, do not run. Stop immediately, drop to the ground, and roll back and forth to smother flames.
4. **PASS Extinguisher Protocol**: Pull the pin, Aim low at the base of the fire, Squeeze the handle evenly, Sweep side-to-side.`;
  }

  if (
    q.includes("kit") ||
    q.includes("bag") ||
    q.includes("supplies") ||
    q.includes("pack") ||
    q.includes("checklist")
  ) {
    return `🎒 **72-Hour Disaster Emergency Go-Bag Checklist**:
- **Water**: 1 gallon per person per day (3-day minimum supply).
- **Food**: 3-day supply of non-perishable, high-calorie food (energy bars, ready-to-eat canned goods + manual can opener).
- **Lighting & Power**: High-lumen LED flashlight, battery/solar NOAA emergency radio, extra batteries, power banks.
- **First Aid Kit**: Antiseptic wipes, sterile gauze pads, bandages, tourniquet, burn dressing, and prescription medications.
- **Tools & Safety**: Multi-tool / pocket knife, emergency whistle, N95 dust masks, waterproof matches.
- **Documents & Cash**: Copies of IDs, insurance papers in a sealed waterproof pouch, small cash bills.`;
  }

  if (
    q.includes("cyclone") ||
    q.includes("hurricane") ||
    q.includes("storm") ||
    q.includes("wind") ||
    q.includes("tornado")
  ) {
    return `🌪️ **Cyclone & Severe Storm Safety Protocol**:
1. **Secure Surroundings**: Board up windows or close storm shutters; secure outdoor furniture, debris, and trash cans.
2. **Safe Room**: Move to an interior room, hallway, or bathroom on the lowest floor away from exterior windows and glass.
3. **Monitor Broadcasts**: Keep your battery-powered radio tuned to regional emergency alert channels.
4. **Power Outage Precautions**: Use flashlights instead of open candles to eliminate fire hazard risks.`;
  }

  return `🛡️ **SafeGraph Emergency Advice for "${userQuery}"**:
- **Assess Immediate Risk**: Check your surroundings for structural hazards, active fires, or water ingress.
- **Follow Verified Protocols**: Rely on institutional emergency evacuation routes and local emergency announcements.
- **Stay Connected**: Keep an emergency communication line open with designated family points of contact.
- **Need specific guidance?** You can ask about *Heatwave predictions*, *Floods*, *Earthquakes*, *Fire safety*, or *Emergency Go-Bag checklists*.`;
}

export async function POST(request: Request) {
  const session = await getSessionUser();
  const userId = session ? session.id : null;

  try {
    const body = await request.json();
    const { text } = body;

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "Query text is required." },
        { status: 400 },
      );
    }

    const userPrompt = text.trim();

    // 1. Save user query in chat_messages table if logged in
    if (userId) {
      try {
        await query(
          "INSERT INTO resq_chat_messages (user_id, sender, message) VALUES ($1, 'user', $2)",
          [userId, userPrompt],
        );
      } catch (e) {
        console.warn("Failed to record chat history:", e);
      }
    }

    // 2. Fetch live ML Heatwave prediction if query is heatwave-related
    const heatwavePrediction = await fetchHeatwavePrediction(userPrompt);

    let replyText = "";

    // 3. Check if GEMINI_API_KEY is configured
    if (process.env.GEMINI_API_KEY) {
      try {
        const systemPrompt = `You are SafeGraph AI, a certified disaster preparedness, safety, and emergency response educational assistant for schools, colleges, and students.
Provide clear, actionable, life-saving advice formatted with clean Markdown bullet points. Keep it concise, authoritative, and encouraging.

${heatwavePrediction ? `AUTHORITATIVE REAL-TIME ML HEATWAVE MODEL DATA:\n${JSON.stringify(heatwavePrediction, null, 2)}\nUse the exact temperature, probability, and risk level numbers provided above.` : ""}

User question: ${userPrompt}`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: systemPrompt }],
                },
              ],
            }),
          },
        );

        const geminiData = await geminiRes.json();
        const candidate = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

        if (candidate) {
          replyText = candidate;
        }
      } catch (err) {
        console.warn(
          "Gemini API call error, falling back to local engine:",
          err,
        );
      }
    }

    // 4. Fallback Knowledge Engine (if Gemini key is absent or failed)
    if (!replyText) {
      if (heatwavePrediction) {
        replyText = generateGroundedHeatwaveResponse(heatwavePrediction);
      } else {
        replyText = generateKnowledgeGraphResponse(userPrompt);
      }
    }

    // 5. Save bot response in chat_messages if logged in
    if (userId) {
      try {
        await query(
          "INSERT INTO resq_chat_messages (user_id, sender, message) VALUES ($1, 'bot', $2)",
          [userId, replyText],
        );
      } catch (e) {
        console.warn("Failed to record bot reply history:", e);
      }
    }

    return NextResponse.json({
      message: replyText,
      verifiedBy: heatwavePrediction
        ? "SafeGraph Heatwave ML Model & Knowledge Graph"
        : "Knowledge Graph & SafeGraph AI Engine",
    });
  } catch (error: any) {
    console.error("Assistant chat error:", error);

    return NextResponse.json(
      { error: "Failed to generate assistant response" },
      { status: 500 },
    );
  }
}
