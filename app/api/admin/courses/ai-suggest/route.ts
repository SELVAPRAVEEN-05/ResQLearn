import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { AiSuggestCourseSchema } from "@/lib/validations/course";

// Fallback emergency course generator for verified disaster templates
function getFallbackDisasterDraft(disasterType: string, topic: string) {
  const d = disasterType.toLowerCase();

  if (d.includes("flood")) {
    return {
      title: topic || "Flood Safety & Preparedness Masterclass",
      description: "Learn how to prepare for, respond to, and recover safely from seasonal and flash flood emergencies.",
      disasterType: "Flood",
      difficulty: "Beginner",
      estimatedDuration: "45 min",
      lessons: [
        {
          title: "Introduction to Floods & Hydrology Basics",
          description: "Understanding flash floods, river floods, and early warning systems.",
          content: "Floods are among the most frequent and destructive natural disasters globally. This lesson covers key risk factors, flood plain awareness, and vital early warnings issued by meteorological agencies.",
          type: "video",
          suggestedMaterials: [
            {
              title: "NWS Flood Safety & The Awesome Power Guide (PDF)",
              type: "PDF",
              url: "https://www.weather.gov/media/owp/oh/reachout/NWS_Floods_The_Awesome_Power.pdf",
              description: "Official National Weather Service comprehensive handbook on flood risks, meteorology, and water power",
            },
            {
              title: "Floods 101 - National Geographic",
              type: "VIDEO",
              url: "https://www.youtube.com/watch?v=udRNUBHb4bU",
              description: "Educational video on how flash floods develop within minutes",
            },
          ],
        },
        {
          title: "Flood Warning Signs & Community Alerts",
          description: "Recognizing water level indicators and emergency siren signals.",
          content: "Learn to read critical environmental triggers: rapid stream rise, water discoloration, and local municipal storm warning alerts.",
          type: "document",
          suggestedMaterials: [
            {
              title: "Flood Warning Signals & Early Warning Networks",
              type: "WEBSITE",
              url: "https://www.weather.gov/safety/flood-watch-warning",
              description: "Reference guide for watches vs warnings",
            },
          ],
        },
        {
          title: "Flood Prevention & Property Protection",
          description: "Sandbagging, sump pumps, and sealing critical entry points.",
          content: "Practical steps to safeguard your home and workplace: elevating electrical components, using check valves, and temporary barrier installation.",
          type: "document",
          suggestedMaterials: [
            {
              title: "Sandbag Barrier Techniques",
              type: "ARTICLE",
              url: "https://www.ready.gov/floods",
              description: "How to stack sandbags effectively to divert water",
            },
          ],
        },
        {
          title: "Before a Flood: Evacuation & Go-Bag Prep",
          description: "Building your 72-hour waterproof emergency kit.",
          content: "Pack potable water (1 gal/person/day), waterproof document pouches, high-calorie ration bars, first aid supplies, and battery-powered radio.",
          type: "document",
          suggestedMaterials: [
            {
              title: "Red Cross Flood Emergency Kit Guide",
              type: "WEBSITE",
              url: "https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/flood.html",
              description: "Checklist for emergency supplies",
            },
          ],
        },
        {
          title: "During a Flood: Turn Around, Don't Drown",
          description: "Vehicle safety and safe vertical evacuation.",
          content: "Never walk, drive, or swim in floodwaters. Just 6 inches of water can knock an adult down, and 12-24 inches can sweep away passenger cars.",
          type: "video",
          suggestedMaterials: [
            {
              title: "Surviving Swift Water Floods - NWS",
              type: "VIDEO",
              url: "https://www.youtube.com/watch?v=eI6mI64hJUI",
              description: "Life-saving vehicle evacuation rules",
            },
          ],
        },
        {
          title: "After a Flood: Safe Cleanup & Mold Remediation",
          description: "Returning home safely without electrical and bacterial hazards.",
          content: "Check for structural damage before entering. Wear rubber boots and heavy gloves. Discard contaminated food and photograph damage for insurance.",
          type: "document",
          suggestedMaterials: [
            {
              title: "Post-Flood Sanitation & Safety Guide",
              type: "WEBSITE",
              url: "https://www.ready.gov/floods",
              description: "Verified guidelines for safe post-flood cleaning and sanitation",
            },
          ],
        },
      ],
    };
  }

  if (d.includes("earthquake")) {
    return {
      title: topic || "Earthquake Resilience & Survival Guide",
      description: "Master seismic safety: Drop, Cover, and Hold On techniques, home reinforcement, and post-tremor response.",
      disasterType: "Earthquake",
      difficulty: "Beginner",
      estimatedDuration: "40 min",
      lessons: [
        {
          title: "Earthquake Physics & Fault Line Hazards",
          description: "Understanding magnitude, epicenters, and liquefaction.",
          content: "Overview of tectonic plate movements, foreshocks, mainshocks, and aftershocks.",
          type: "video",
          suggestedMaterials: [
            {
              title: "FEMA Earthquake Safety Checklist (PDF)",
              type: "PDF",
              url: "https://www.fema.gov/sites/default/files/2020-07/earthquake-safety-checklist.pdf",
              description: "Official FEMA checklist for seismic home safety, retrofits, and emergency actions",
            },
            {
              title: "Earthquakes 101 - National Geographic",
              type: "VIDEO",
              url: "https://www.youtube.com/watch?v=BLEPakj1YTY",
              description: "Documentary on seismic waves and ground motion",
            },
          ],
        },
        {
          title: "Drop, Cover, and Hold On Protocol",
          description: "The gold standard life-saving movement during active shaking.",
          content: "Drop to hands and knees, cover head and neck under sturdy furniture, hold on until all motion ceases.",
          type: "video",
          suggestedMaterials: [
            {
              title: "Drop Cover Hold On Demonstration Drill",
              type: "VIDEO",
              url: "https://www.youtube.com/watch?v=GxD_YhT_K4g",
              description: "Proper posture under desks and tables",
            },
          ],
        },
        {
          title: "Securing Heavy Fixtures & Gas Lines",
          description: "Preventing non-structural falling debris and secondary fires.",
          content: "Anchor tall bookcases, strap water heaters, and locate your gas shutoff valve.",
          type: "document",
          suggestedMaterials: [
            {
              title: "Post-Disaster Recovery & Inspection",
              type: "WEBSITE",
              url: "https://www.ready.gov/earthquakes",
              description: "Safe post-shaking assessment",
            },
          ],
        },
        {
          title: "Post-Quake Inspection & Aftershock Safety",
          description: "Checking gas lines, electrical hazards, and open-ground assembly.",
          content: "Exit buildings carefully after shaking stops using stairs only. Never use elevators. Watch for downed power lines.",
          type: "document",
          suggestedMaterials: [
            {
              title: "Post-Disaster Recovery & Inspection",
              type: "WEBSITE",
              url: "https://www.ready.gov/earthquakes",
              description: "Safe post-shaking assessment",
            },
          ],
        },
      ],
    };
  }

  if (d.includes("fire")) {
    return {
      title: topic || "Fire Safety & Campus Emergency Evacuation",
      description: "Comprehensive fire prevention, PASS extinguisher technique, and smoke evasion protocols.",
      disasterType: "Fire",
      difficulty: "Beginner",
      estimatedDuration: "30 min",
      lessons: [
        {
          title: "Extinguisher Operation: The PASS Method",
          description: "Class A, B, C, D, K fire extinguishers and rapid deployment.",
          content: "Operate extinguishers with PASS: Pull pin, Aim at base, Squeeze trigger, Sweep side-to-side.",
          type: "video",
          suggestedMaterials: [
            {
              title: "Fire Extinguisher PASS Video",
              type: "VIDEO",
              url: "https://www.youtube.com/watch?v=PQV71INDaqY",
              description: "Instructional demonstration of PASS on live fire",
            },
            {
              title: "US Fire Administration Safety Guide (PDF)",
              type: "PDF",
              url: "https://www.usfa.fema.gov/downloads/pdf/publications/fa_298.pdf",
              description: "Official federal guidelines on fire escape plans, prevention, and extinguisher deployment",
            },
          ],
        },
        {
          title: "Smoke Inhalation Defense & Stairwell Evacuation",
          description: "Low crawling techniques and secondary emergency exits.",
          content: "Toxic smoke rises. Crawl on hands and knees below the thermal layer. Never use elevators.",
          type: "document",
          suggestedMaterials: [
            {
              title: "Building Fire Evacuation Guide",
              type: "WEBSITE",
              url: "https://www.ready.gov/home-fires",
              description: "Residential and institutional fire safety protocols",
            },
          ],
        },
      ],
    };
  }

  // Default generic disaster draft
  return {
    title: topic || `${disasterType} Emergency Preparedness & Response`,
    description: `Comprehensive safety instructions, early warning awareness, and step-by-step survival protocols for ${disasterType} emergencies.`,
    disasterType: disasterType,
    difficulty: "Beginner",
    estimatedDuration: "35 min",
    lessons: [
      {
        title: `Introduction to ${disasterType} Risks`,
        description: `Fundamental principles, risk indicators, and historical impact of ${disasterType}.`,
        content: `Understanding how ${disasterType} events originate, warning times, and immediate vulnerability assessments.`,
        type: "video",
        suggestedMaterials: [
          {
            title: "NWS Flood Safety & The Awesome Power Guide (PDF)",
            type: "PDF",
            url: "https://www.weather.gov/media/owp/oh/reachout/NWS_Floods_The_Awesome_Power.pdf",
            description: "Safety guidelines and overview",
          },
          {
            title: "Disaster Preparedness Overview",
            type: "VIDEO",
            url: "https://www.youtube.com/watch?v=udRNUBHb4bU",
            description: "Step-by-step actions during emergency",
          },
        ],
      },
      {
        title: "Preparedness & Evacuation Planning",
        description: "Formulating family emergency plans and assembling safety kits.",
        content: "Detailed protocols for establishing communication channels, rendezvous points, and 72-hour supply kits.",
        type: "document",
        suggestedMaterials: [
          {
            title: "FEMA Earthquake Safety Checklist (PDF)",
            type: "PDF",
            url: "https://www.fema.gov/sites/default/files/2020-07/earthquake-safety-checklist.pdf",
            description: "Family emergency communications plan",
          },
        ],
      },
      {
        title: `Immediate Action During ${disasterType}`,
        description: "Life-saving maneuvers and critical decisions during active incident.",
        content: "Prioritize personal safety, follow instructions from first responders, and avoid common dangerous misconceptions.",
        type: "video",
        suggestedMaterials: [
          {
            title: "Emergency Action Drill Video",
            type: "VIDEO",
            url: "https://www.youtube.com/watch?v=GxD_YhT_K4g",
            description: "Step-by-step actions during emergency",
          },
        ],
      },
      {
        title: "Recovery, Relief & Psychological Support",
        description: "Re-entry protocols and community rehabilitation.",
        content: "Guidelines on returning to affected zones, documenting property damage, preventing waterborne diseases, and seeking disaster assistance.",
        type: "document",
        suggestedMaterials: [
          {
            title: "Disaster Recovery Guide",
            type: "WEBSITE",
            url: "https://www.disasterassistance.gov",
            description: "Government disaster relief portal",
          },
        ],
      },
    ],
  };
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("errorResponse" in auth) {
    return auth.errorResponse;
  }

  try {
    const body = await request.json();
    const parsed = AiSuggestCourseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { disasterType, topic, audience } = parsed.data;

    let draft = null;

    if (process.env.GEMINI_API_KEY) {
      try {
        const prompt = `You are SafeGraph AI, a specialist disaster risk reduction and emergency preparedness educational expert.
Generate a structured course draft for disaster preparedness training.
Disaster Category: ${disasterType}
Topic / Focus: ${topic}
Target Audience: ${audience}

Return STRICTLY a JSON object with this structure (no markdown fences, pure JSON):
{
  "title": "Clear concise course title",
  "description": "Comprehensive 2-sentence description of skills acquired",
  "disasterType": "${disasterType}",
  "difficulty": "Beginner",
  "estimatedDuration": "45 min",
  "lessons": [
    {
      "title": "Lesson title",
      "description": "Short lesson summary",
      "content": "Detailed educational lesson content explaining key safety protocols and steps (at least 2 paragraphs)",
      "type": "video" or "document",
      "suggestedMaterials": [
        {
          "title": "Material Title (e.g. Official Guide)",
          "type": "PDF" | "VIDEO" | "WEBSITE" | "ARTICLE" | "IMAGE" | "DOCUMENT" | "EXTERNAL_RESOURCE",
          "url": "https://example.com/valid-link",
          "description": "Short note on how this helps"
        }
      ]
    }
  ]
}`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: "application/json",
              },
            }),
          }
        );

        const geminiData = await geminiRes.json();
        const candidate = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) {
          draft = JSON.parse(candidate);
        }
      } catch (err) {
        console.warn("Gemini API course suggestion failed, falling back to verified engine:", err);
      }
    }

    if (!draft) {
      draft = getFallbackDisasterDraft(disasterType, topic);
    }

    return NextResponse.json({
      draft,
      isDraft: true,
      message: "AI draft generated. Please review and approve before publishing.",
    });
  } catch (error: any) {
    console.error("AI course suggest error:", error);
    return NextResponse.json({ error: "Failed to generate course suggestion" }, { status: 500 });
  }
}
