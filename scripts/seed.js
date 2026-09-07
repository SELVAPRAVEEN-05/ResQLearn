const pool = require("../db");
const bcrypt = require("bcryptjs");

async function seed() {
  console.log("🌱 Seeding SafeGraph AI PostgreSQL Database with Admin Credentials & Authentic Courses & Materials...");

  try {
    // 1. Seed Only Admin Account (Students can register dynamically or log in)
    const adminPasswordHash = await bcrypt.hash("admin123", 10);

    // Clean old records for clean seed
    await pool.query("DELETE FROM resq_chat_messages");
    await pool.query("DELETE FROM resq_user_alert_reads");
    await pool.query("DELETE FROM resq_alerts");
    await pool.query("DELETE FROM resq_quiz_attempts");
    await pool.query("DELETE FROM resq_quiz_questions");
    await pool.query("DELETE FROM resq_quizzes");
    await pool.query("DELETE FROM resq_user_lesson_progress");
    await pool.query("DELETE FROM resq_user_course_progress");
    await pool.query("DELETE FROM resq_materials");
    await pool.query("DELETE FROM resq_lessons");
    await pool.query("DELETE FROM resq_courses");

    // Seed Admin Account
    const userRes = await pool.query(
      `
      INSERT INTO resq_users (name, email, password_hash, role, institution, department, year_of_study, preparedness_score, certificates, status)
      VALUES 
        ('Admin Administrator', 'admin@safegraph.ai', $1, 'admin', 'SafeGraph AI Emergency Operations', 'Disaster Management & Response', 'Faculty Lead', 100, 5, 'Active')
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        institution = EXCLUDED.institution,
        department = EXCLUDED.department,
        year_of_study = EXCLUDED.year_of_study,
        preparedness_score = EXCLUDED.preparedness_score,
        certificates = EXCLUDED.certificates,
        status = EXCLUDED.status
      RETURNING id, email, name, role;
      `,
      [adminPasswordHash]
    );
    console.log(`✅ Seeded Admin Account: ${userRes.rows[0].email} (Password: admin123).`);

    // Seed/Ensure Student Account prasanth@gmail.com
    const studentPasswordHash = await bcrypt.hash("bitsathy", 10);
    await pool.query(
      `
      INSERT INTO resq_users (name, email, password_hash, role, institution, department, year_of_study, preparedness_score, certificates, status)
      VALUES 
        ('Prasanth', 'prasanth@gmail.com', $1, 'student', 'Bannari Amman Institute of Technology (BIT)', 'Computer Science & Engineering', '3rd Year', 80, 2, 'Active')
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        status = 'Active';
      `,
      [studentPasswordHash]
    );
    console.log(`✅ Seeded/Verified Student Account: prasanth@gmail.com (Password: bitsathy).`);

    // 2. Seed Real Disaster Preparedness Courses & Verified Curriculum with Materials
    const courses = [
      {
        slug: "flood-safety-preparedness",
        title: "Flood Safety & Preparedness",
        description: "Learn how to prepare for, respond to, and recover safely from seasonal and flash flood situations.",
        disasterType: "Flood",
        iconName: "Droplet",
        difficulty: "Beginner",
        duration: "45 min",
        published: true,
        lessons: [
          {
            id: "flood-intro-basics",
            title: "Introduction to Floods",
            description: "Understanding riverine, coastal, and rapid flash flood mechanisms.",
            type: "video",
            content: "Floods are the most common natural disaster worldwide. In this introductory lesson, you will learn the hydrological fundamentals of riverine inundation, urban flash flooding, and coastal storm surges. Early identification of rising water levels saves lives.",
            materials: [
              {
                title: "NWS Official Flood Safety & Preparedness Portal",
                type: "WEBSITE",
                url: "https://www.weather.gov/safety/flood",
                description: "Official National Weather Service comprehensive portal on flood safety, forecasting, and preparedness"
              },
              {
                title: "Floods 101 - National Geographic",
                type: "VIDEO",
                url: "https://www.youtube.com/watch?v=4PXj7bOD7IY",
                description: "Educational video overview explaining flash flood genesis, forces, and velocity"
              }
            ]
          },
          {
            id: "flood-warning-signs",
            title: "Flood Warning Signs",
            description: "Recognizing water level indicators, flash flood watches, and warning sirens.",
            type: "document",
            content: "Recognizing early warnings gives critical evacuation lead time. Differentiate between a Flood Watch (conditions are favorable for flooding) and a Flood Warning (flooding is imminent or already occurring). Inspect local streams, catch basins, and municipal emergency broadcast frequencies.",
            materials: [
              {
                title: "Flood Warning Signs & Early Warning Guide",
                type: "WEBSITE",
                url: "https://www.weather.gov/safety/flood-watch-warning",
                description: "National Weather Service guide to watches, warnings, and advisories"
              }
            ]
          },
          {
            id: "flood-prevention-mitigation",
            title: "Flood Prevention",
            description: "Property defense, sandbagging methods, and drainage clearing.",
            type: "document",
            content: "Mitigate water ingress before floodwaters arrive. Implement sandbag barrier construction, install sump pumps with battery backup systems, clear exterior storm drains of debris, and install check valves to prevent toxic sewer backflow into habitable areas.",
            materials: [
              {
                title: "Flood Prevention & Property Defense Manual",
                type: "ARTICLE",
                url: "https://www.ready.gov/floods",
                description: "Step-by-step structural prevention and property mitigation techniques"
              }
            ]
          },
          {
            id: "before-a-flood-preparation",
            title: "Before a Flood",
            description: "Evacuation route planning and assembling your 72-hour waterproof emergency kit.",
            type: "document",
            content: "Preparation in advance ensures immediate safety during crisis. Map primary and secondary evacuation corridors away from low-lying bridges and underpasses. Store critical IDs, insurance papers, deeds, and medical records in a sealed waterproof pouch.",
            materials: [
              {
                title: "Red Cross Flood Emergency Planning Guide",
                type: "WEBSITE",
                url: "https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/flood.html",
                description: "Official emergency preparedness checklist and 72-hour survival kit specification"
              }
            ]
          },
          {
            id: "during-a-flood-survival",
            title: "During a Flood",
            description: "Vehicle safety, Turn Around Don't Drown protocols, and safe vertical relocation.",
            type: "video",
            content: "During an active flood, never drive or walk through moving water. As little as 6 inches of rapid water can sweep an adult off their feet, and 12-24 inches can carry away passenger vehicles. If trapped inside a building, move to the top floor but avoid sealed attics without roof access.",
            materials: [
              {
                title: "Turn Around Don't Drown - NWS Flood Safety Video",
                type: "VIDEO",
                url: "https://www.youtube.com/watch?v=5JUsYrjg6xU",
                description: "Swift water rescue demonstration and vehicle safety rules"
              }
            ]
          },
          {
            id: "after-a-flood-recovery",
            title: "After a Flood",
            description: "Safe re-entry, electrical hazard inspection, disinfection, and mold remediation.",
            type: "document",
            content: "Post-flood environments contain severe hidden hazards: contaminated biological water, gas line leaks, weakened floorboards, and displaced venomous wildlife. Never turn on electrical appliances until inspected by a certified electrician. Wear protective rubber boots and masks during cleanup.",
            materials: [
              {
                title: "Post-Flood Safety & Sanitation Resource Guide",
                type: "WEBSITE",
                url: "https://www.ready.gov/floods",
                description: "Verified guidelines for safe post-flood sanitation and safety inspection"
              }
            ]
          }
        ]
      },
      {
        slug: "earthquake-safety-resilience",
        title: "Earthquake Safety & Structural Resilience",
        description: "Globally verified protocols for structural risk mitigation, Drop-Cover-Hold-On execution, and post-quake triage.",
        disasterType: "Earthquake",
        iconName: "Activity",
        difficulty: "Intermediate",
        duration: "35 min",
        published: true,
        lessons: [
          {
            id: "seismic-principles",
            title: "Seismology & Fault-Line Ground Motion",
            description: "Understanding P and S waves, epicenters, and structural frequencies.",
            type: "video",
            content: "Earthquakes generate destructive shear and surface waves. Most casualties stem from falling non-structural architectural elements, shattered glazing, and ruptured gas lines rather than ground fissures.",
            materials: [
              {
                title: "Ready.gov Official Earthquake Preparedness Guide",
                type: "WEBSITE",
                url: "https://www.ready.gov/earthquakes",
                description: "Official federal emergency guidelines for seismic home safety, retrofits, and emergency actions"
              },
              {
                title: "Earthquakes 101 - National Geographic",
                type: "VIDEO",
                url: "https://www.youtube.com/watch?v=e7ho6z32yyo",
                description: "Documentary explaining seismic wave dynamics and fault line movement"
              }
            ]
          },
          {
            id: "drop-cover-holdon-protocol",
            title: "The 'Drop, Cover, and Hold On' Action Chain",
            description: "Life-saving maneuvers during active seismic shaking.",
            type: "video",
            content: "The moment ground tremors begin: DROP onto your hands and knees. COVER your head and neck under a sturdy table. HOLD ON until shaking completely stops. If outdoors, move to open clear zones.",
            materials: [
              {
                title: "Earthquake Protection & Drop-Cover Drill",
                type: "VIDEO",
                url: "https://www.youtube.com/watch?v=BLEPakj1YTY",
                description: "Demonstration of safe posture under desks and furniture during tremors"
              }
            ]
          },
          {
            id: "post-quake-containment",
            title: "Rapid Utility Containment & Post-Quake Inspection",
            description: "Shutting gas valves and preventing post-seismic fires.",
            type: "document",
            content: "Inspect gas lines for sulfur odors and isolate main shutoff valves immediately. Switch off main electrical circuit panels to avoid sparking gas pockets.",
            materials: [
              {
                title: "Post-Disaster Utility Safety Guide",
                type: "WEBSITE",
                url: "https://www.ready.gov/earthquakes",
                description: "Safe post-shaking utility inspection"
              }
            ]
          }
        ]
      },
      {
        slug: "cyclone-severe-storm-survival",
        title: "Cyclone & Severe Storm Survival",
        description: "Comprehensive coastal defense, gale-force wind safety, and storm surge evacuation strategies.",
        disasterType: "Cyclone",
        iconName: "Wind",
        difficulty: "Beginner",
        duration: "30 min",
        published: true,
        lessons: [
          {
            id: "cyclone-intensity-scales",
            title: "Tropical Cyclone Scales & Storm Surge Dynamics",
            description: "Understanding wind velocity categories and atmospheric pressure drops.",
            type: "video",
            content: "Tropical cyclones generate severe sustained winds exceeding 120 km/h and massive coastal storm surges. Learn how low pressure creates sea water domes that inundate coastal belts.",
            materials: [
              {
                title: "NWS Official Hurricane & Storm Safety Guide",
                type: "WEBSITE",
                url: "https://www.weather.gov/safety/hurricane",
                description: "National Weather Service comprehensive coastal storm preparedness and evacuation portal"
              },
              {
                title: "Hurricanes & Cyclones 101 - National Geographic",
                type: "VIDEO",
                url: "https://www.youtube.com/watch?v=zP4rgvu4xDE",
                description: "Visual analysis of tropical storm eye development and storm surge physics"
              }
            ]
          },
          {
            id: "high-wind-structural-defense",
            title: "Window Shuttering & Cyclone Shelter Relocation",
            description: "Securing premises and migrating to designated multi-hazard shelters.",
            type: "document",
            content: "Board up windows with approved shutters or exterior plywood. When evacuation warnings trigger, relocate immediately to designated concrete cyclone shelters.",
            materials: [
              {
                title: "Storm Shelter & Defense Protocol",
                type: "WEBSITE",
                url: "https://www.ready.gov/hurricanes",
                description: "Cyclone shelter readiness and safety steps"
              }
            ]
          }
        ]
      },
      {
        slug: "fire-safety-campus-evacuation",
        title: "Fire Safety & Emergency Evacuation",
        description: "Essential fire chemistry, extinguisher operation (PASS), and smoke evasion tactics.",
        disasterType: "Fire",
        iconName: "Flame",
        difficulty: "Beginner",
        duration: "20 min",
        published: true,
        lessons: [
          {
            id: "extinguisher-pass-technique",
            title: "Extinguisher Classes & the PASS Technique",
            description: "Class A, B, C, D, K fire extinguishers and rapid deployment.",
            type: "video",
            content: "Operate extinguishers with PASS: Pull the pin, Aim low at the base of the fire, Squeeze the lever, and Sweep side-to-side across the burning area.",
            materials: [
              {
                title: "Fire Extinguisher Operation (PASS) Video",
                type: "VIDEO",
                url: "https://www.youtube.com/watch?v=PQV71INDaqY",
                description: "Instructional demonstration of the PASS technique on live fire"
              },
              {
                title: "Ready.gov Home Fire Safety & Prevention Guide",
                type: "WEBSITE",
                url: "https://www.ready.gov/home-fires",
                description: "Official guidelines on fire escape plans, prevention, and home protection"
              }
            ]
          },
          {
            id: "smoke-inhalation-defense",
            title: "Smoke Inhalation Defense & Stairwell Evacuation",
            description: "Low-crawl navigation and emergency stairwell protocols.",
            type: "document",
            content: "In building fires, superheated toxic smoke and carbon monoxide rise rapidly. Stay below 2 feet from the floor where breathable oxygen remains coolest. Feel door handles with the back of your hand before turning; never use elevators.",
            materials: [
              {
                title: "Red Cross Fire Evacuation & Prevention Portal",
                type: "WEBSITE",
                url: "https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/fire.html",
                description: "Step-by-step smoke evasion and emergency escape planning"
              }
            ]
          }
        ]
      }
    ];

    let totalLessonsCount = 0;
    let totalMaterialsCount = 0;

    for (const c of courses) {
      const courseRes = await pool.query(
        `
        INSERT INTO resq_courses (slug, title, description, category, thumbnail, difficulty, duration, icon_name, is_published, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id;
        `,
        [c.slug, c.title, c.description, c.disasterType, null, c.difficulty, c.duration, c.iconName, c.published]
      );
      const courseId = courseRes.rows[0].id;

      for (let i = 0; i < c.lessons.length; i++) {
        const l = c.lessons[i];
        const lessonRes = await pool.query(
          `
          INSERT INTO resq_lessons (lesson_id, course_id, title, type, content, order_index, description, is_published, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING id;
          `,
          [l.id, courseId, l.title, l.type || "document", l.content, i, l.description || ""]
        );
        const lessonDbId = lessonRes.rows[0].id;
        totalLessonsCount++;

        if (Array.isArray(l.materials)) {
          for (let mIdx = 0; mIdx < l.materials.length; mIdx++) {
            const m = l.materials[mIdx];
            await pool.query(
              `
              INSERT INTO resq_materials (lesson_id, title, description, type, url, order_index, created_at, updated_at)
              VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
              `,
              [lessonDbId, m.title, m.description || "", m.type, m.url, mIdx]
            );
            totalMaterialsCount++;
          }
        }
      }
    }
    console.log(`✅ Seeded ${courses.length} verified courses, ${totalLessonsCount} lessons, and ${totalMaterialsCount} educational materials.`);

    // 3. Seed Real Assessment Quizzes
    const quizzes = [
      {
        slug: "flood-survival",
        title: "Flood Preparedness & Swift Water Survival Test",
        category: "Flood",
        difficulty: "Hard",
        questions: [
          {
            id: "fl_q1",
            text: "What depth of swift-moving floodwater generates sufficient lateral force to displace most passenger vehicles and SUVs?",
            options: ["6 inches (15 cm)", "12 inches (30 cm)", "24 inches (60 cm)", "48 inches (120 cm)"],
            correctAnswerIndex: 2,
            explanation: "Just 2 feet (24 inches) of rushing water will float and sweep away virtually all standard passenger cars, pickup trucks, and SUVs."
          },
          {
            id: "fl_q2",
            text: "If rising floodwaters trap occupants inside a multi-story building, which action follows standard emergency doctrine?",
            options: [
              "Move to the highest floor while avoiding enclosed attics without a roof escape hatch",
              "Dive out the ground-floor window into the current to swim to safety",
              "Seek shelter in the subterranean basement",
              "Anchor yourself inside the ground-level garage"
            ],
            correctAnswerIndex: 0,
            explanation: "Move to higher levels. Avoid entering sealed attics without roof access, as rising water can submerge the attic, trapping occupants against the roofline."
          },
          {
            id: "fl_q3",
            text: "What is the recommended minimum potable drinking water requirement per person per day in an emergency survival cache?",
            options: ["0.25 gallons (1 liter)", "1 gallon (approx. 3.8 liters)", "5 gallons (19 liters)", "10 gallons (38 liters)"],
            correctAnswerIndex: 1,
            explanation: "FEMA and Red Cross guidelines recommend a minimum of 1 gallon of potable water per person per day for at least 72 hours."
          }
        ]
      },
      {
        slug: "earthquake-basics",
        title: "Earthquake Safety & Response Assessment",
        category: "Earthquake",
        difficulty: "Medium",
        questions: [
          {
            id: "eq_q1",
            text: "What is the scientifically verified immediate action when feeling strong earthquake shaking indoors?",
            options: [
              "Run outside to open streets immediately",
              "Drop, Cover, and Hold On beneath a sturdy desk or interior wall",
              "Stand upright beneath a doorway frame",
              "Take an elevator down to ground level"
            ],
            correctAnswerIndex: 1,
            explanation: "Drop, Cover, and Hold On protects vital organs from falling non-structural debris, the leading cause of seismic injuries."
          }
        ]
      }
    ];

    for (const q of quizzes) {
      const quizRes = await pool.query(
        `
        INSERT INTO resq_quizzes (slug, title, category, difficulty)
        VALUES ($1, $2, $3, $4)
        RETURNING id;
        `,
        [q.slug, q.title, q.category, q.difficulty]
      );
      const quizId = quizRes.rows[0].id;

      for (let i = 0; i < q.questions.length; i++) {
        const item = q.questions[i];
        await pool.query(
          `
          INSERT INTO resq_quiz_questions (question_id, quiz_id, text, options, correct_answer_index, explanation, order_index)
          VALUES ($1, $2, $3, $4, $5, $6, $7);
          `,
          [item.id, quizId, item.text, JSON.stringify(item.options), item.correctAnswerIndex, item.explanation, i]
        );
      }
    }
    console.log(`✅ Seeded ${quizzes.length} authentic quizzes.`);

    // 4. Seed Real Emergency Broadcast Advisories
    const alerts = [
      {
        alert_id: "alert_flood_basin_warning_2026",
        title: "Hydrological Advisory: Upstream River Catchment Surge",
        message: "Heavy sustained precipitation across the river catchment has increased reservoir inflow. Low-lying corridors are under active advisory. Avoid all riverbank crossings.",
        severity: "High"
      }
    ];

    for (const a of alerts) {
      await pool.query(
        `
        INSERT INTO resq_alerts (alert_id, title, message, severity, is_active)
        VALUES ($1, $2, $3, $4, TRUE);
        `,
        [a.alert_id, a.title, a.message, a.severity]
      );
    }
    console.log(`✅ Seeded emergency alerts.`);
    console.log("🎉 Complete SafeGraph AI seed finished successfully!");
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
