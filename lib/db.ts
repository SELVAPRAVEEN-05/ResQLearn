import { Pool } from "pg";

const RAW_DATABASE_URL =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  "";

// node-postgres does not support channel_binding, but it does use sslmode.
const sanitizedConnectionString = RAW_DATABASE_URL.replace(
  /[?&]channel_binding=[^&]+/g,
  "",
);

declare global {
  var _pgPool: Pool | undefined;
  var _fallbackStoreActive: boolean | undefined;
}

if (!global._pgPool) {
  global._pgPool = new Pool({
    connectionString: sanitizedConnectionString,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 3000,
  });

  // Handle background pool errors gracefully
  global._pgPool.on("error", (err) => {
    console.warn("Unexpected idle client error in pg pool:", err.message);
  });
}

const pool: Pool = global._pgPool;

export default pool;

// Local In-Memory Database Fallback for offline or database connection failure
const fallbackStore = {
  users: [
    {
      id: 1,
      name: "SafeGraph Admin",
      email: "admin@safegraph.ai",
      password_hash:
        "$2b$10$pyQzPCY/F7XBaX7VKRA.fuE6jBXeKxwp9iECTXPn37BcQqGZSyoQy", // admin123
      role: "admin",
      institution: "SafeGraph AI Command",
      department: "Administration",
      year_of_study: "Faculty Lead",
      status: "Active",
      preparedness_score: 100,
      certificates: 5,
      avatar: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      name: "Prasanth",
      email: "prasanth@gmail.com",
      password_hash:
        "$2b$10$HIyQ4X/jv5xFApeaZfwy0uive5Du2kz0ayDBDgt/Uj9mVUzLtWCBK", // bitsathy
      role: "student",
      institution: "Bannari Amman Institute of Technology (BIT)",
      department: "Computer Science & Engineering",
      year_of_study: "3rd Year",
      status: "Active",
      preparedness_score: 80,
      certificates: 2,
      avatar: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  courses: [
    {
      id: 1,
      slug: "flood-safety-preparedness",
      title: "Flood Safety & Preparedness",
      description:
        "Learn how to prepare for, respond to, and recover safely from seasonal and flash flood situations.",
      category: "Flood",
      thumbnail: null,
      difficulty: "Beginner",
      duration: "45 min",
      icon_name: "Droplet",
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      slug: "earthquake-safety-resilience",
      title: "Earthquake Safety & Structural Resilience",
      description:
        "Globally verified protocols for structural risk mitigation, Drop-Cover-Hold-On execution, and post-quake triage.",
      category: "Earthquake",
      thumbnail: null,
      difficulty: "Intermediate",
      duration: "35 min",
      icon_name: "Activity",
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 3,
      slug: "cyclone-severe-storm-survival",
      title: "Cyclone & Severe Storm Survival",
      description:
        "Comprehensive coastal defense, gale-force wind safety, and storm surge evacuation strategies.",
      category: "Cyclone",
      thumbnail: null,
      difficulty: "Beginner",
      duration: "30 min",
      icon_name: "Wind",
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 4,
      slug: "fire-safety-campus-evacuation",
      title: "Fire Safety & Emergency Evacuation",
      description:
        "Essential fire chemistry, extinguisher operation (PASS), and smoke evasion tactics.",
      category: "Fire",
      thumbnail: null,
      difficulty: "Beginner",
      duration: "20 min",
      icon_name: "Flame",
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  quizzes: [
    {
      id: 1,
      slug: "flood-survival",
      title: "Flood Preparedness & Swift Water Survival Test",
      category: "Flood",
      difficulty: "Hard",
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      slug: "earthquake-basics",
      title: "Earthquake Safety & Response Assessment",
      category: "Earthquake",
      difficulty: "Medium",
      created_at: new Date().toISOString(),
    },
  ],
  alerts: [
    {
      id: 1,
      alert_id: "alert_flood_basin_warning_2026",
      title: "Hydrological Advisory: Upstream River Catchment Surge",
      message:
        "Heavy sustained precipitation across the river catchment has increased reservoir inflow. Low-lying corridors are under active advisory. Avoid all riverbank crossings.",
      severity: "High",
      is_active: true,
      expires_at: null,
      created_at: new Date().toISOString(),
    },
  ],
  user_course_progress: [] as any[],
  quiz_attempts: [] as any[],
  emergency_places: [
    {
      id: 1,
      name: "District Central Command Emergency Response Center",
      type: "emergency_center",
      latitude: 11.342,
      longitude: 77.718,
      address: "Main Disaster Command HQ, Central Avenue",
      phone: "1077",
      disaster_types: ["General Emergency", "Flood", "Cyclone", "Fire"],
      capacity: 500,
      verified: true,
      available: true,
      source: "admin",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ] as any[],
};

function executeFallbackQuery(
  text: string,
  params: any[] = [],
): { rows: any[]; rowCount: number } {
  const normalized = text.toLowerCase().trim();

  // 6. SELECT / INSERT / UPDATE / DELETE resq_emergency_places
  if (
    normalized.includes("from resq_emergency_places") ||
    normalized.includes("resq_emergency_places")
  ) {
    if (normalized.startsWith("insert into resq_emergency_places")) {
      const newPlace = {
        id: fallbackStore.emergency_places.length + 1,
        name: params[0] || "Emergency Place",
        type: params[1] || "other",
        latitude: parseFloat(params[2]) || 0,
        longitude: parseFloat(params[3]) || 0,
        address: params[4] || null,
        phone: params[5] || null,
        disaster_types: Array.isArray(params[6])
          ? params[6]
          : ["General Emergency"],
        capacity: params[7] ? parseInt(params[7], 10) : null,
        verified: params[8] !== undefined ? Boolean(params[8]) : true,
        available: params[9] !== undefined ? Boolean(params[9]) : true,
        source: params[10] || "admin",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      fallbackStore.emergency_places.push(newPlace);

      return { rows: [newPlace], rowCount: 1 };
    }

    if (normalized.startsWith("update resq_emergency_places")) {
      // Find ID in params or text
      const idParam = params[params.length - 1];
      const index = fallbackStore.emergency_places.findIndex(
        (p) => p.id === Number(idParam),
      );

      if (index !== -1) {
        // Update fields if provided
        const existing = fallbackStore.emergency_places[index];

        if (params[0] !== undefined) existing.name = params[0];
        if (params[1] !== undefined) existing.type = params[1];
        if (params[2] !== undefined) existing.latitude = parseFloat(params[2]);
        if (params[3] !== undefined) existing.longitude = parseFloat(params[3]);
        if (params[4] !== undefined) existing.address = params[4];
        if (params[5] !== undefined) existing.phone = params[5];
        if (params[6] !== undefined)
          existing.disaster_types = Array.isArray(params[6])
            ? params[6]
            : existing.disaster_types;
        if (params[7] !== undefined)
          existing.capacity = params[7] ? parseInt(params[7], 10) : null;
        if (params[8] !== undefined) existing.verified = Boolean(params[8]);
        if (params[9] !== undefined) existing.available = Boolean(params[9]);
        existing.updated_at = new Date().toISOString();

        return { rows: [existing], rowCount: 1 };
      }

      return { rows: [], rowCount: 0 };
    }

    if (normalized.startsWith("delete from resq_emergency_places")) {
      const idParam = params[0];
      const initialLen = fallbackStore.emergency_places.length;

      fallbackStore.emergency_places = fallbackStore.emergency_places.filter(
        (p) => p.id !== Number(idParam),
      );
      const deletedCount = initialLen - fallbackStore.emergency_places.length;

      return { rows: [], rowCount: deletedCount };
    }

    // SELECT
    if (
      normalized.includes("where verified = true") ||
      normalized.includes("verified = true")
    ) {
      const verifiedOnly = fallbackStore.emergency_places.filter(
        (p) => p.verified,
      );

      return { rows: verifiedOnly, rowCount: verifiedOnly.length };
    }
    if (normalized.includes("where id = $1")) {
      const matched = fallbackStore.emergency_places.filter(
        (p) => p.id === Number(params[0]),
      );

      return { rows: matched, rowCount: matched.length };
    }

    return {
      rows: fallbackStore.emergency_places,
      rowCount: fallbackStore.emergency_places.length,
    };
  }

  // 1. SELECT resq_users
  if (normalized.includes("from resq_users")) {
    if (params.length > 0 && typeof params[0] === "string") {
      const searchTerm = String(params[0]).toLowerCase().trim();
      const matched = fallbackStore.users.filter(
        (u) =>
          u.email.toLowerCase() === searchTerm ||
          u.name.toLowerCase() === searchTerm ||
          (searchTerm === "admin" && u.role === "admin"),
      );

      if (matched.length > 0) {
        return { rows: [matched[0]], rowCount: 1 };
      }
    }

    if (
      normalized.includes("role = 'admin'") ||
      normalized.includes("admin@safegraph.ai")
    ) {
      const adminUser = fallbackStore.users.find(
        (u) => u.role === "admin" || u.email === "admin@safegraph.ai",
      );

      return {
        rows: adminUser ? [adminUser] : [],
        rowCount: adminUser ? 1 : 0,
      };
    }

    return { rows: fallbackStore.users, rowCount: fallbackStore.users.length };
  }

  // 2. INSERT INTO resq_users
  if (normalized.includes("insert into resq_users")) {
    const name = params[0] || "New User";
    const email = params[1] || `user_${Date.now()}@safegraph.ai`;
    const password_hash = params[2] || "hash";
    const role = params[3] || "student";
    const newUser = {
      id: fallbackStore.users.length + 1,
      name,
      email,
      password_hash,
      role,
      institution: params[4] || null,
      department: params[5] || null,
      year_of_study: params[6] || null,
      status: "Active",
      preparedness_score: 0,
      certificates: 0,
      avatar: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    fallbackStore.users.push(newUser);

    return { rows: [newUser], rowCount: 1 };
  }

  // 3. SELECT resq_courses
  if (normalized.includes("from resq_courses")) {
    if (params.length > 0 && typeof params[0] === "string") {
      const matched = fallbackStore.courses.filter((c) => c.slug === params[0]);

      return { rows: matched, rowCount: matched.length };
    }

    return {
      rows: fallbackStore.courses,
      rowCount: fallbackStore.courses.length,
    };
  }

  // 4. SELECT resq_quizzes
  if (normalized.includes("from resq_quizzes")) {
    if (params.length > 0 && typeof params[0] === "string") {
      const matched = fallbackStore.quizzes.filter((q) => q.slug === params[0]);

      return { rows: matched, rowCount: matched.length };
    }

    return {
      rows: fallbackStore.quizzes,
      rowCount: fallbackStore.quizzes.length,
    };
  }

  // 5. SELECT resq_alerts
  if (normalized.includes("from resq_alerts")) {
    const activeAlerts = fallbackStore.alerts.filter((alert) => {
      if (!alert.is_active) return false;
      if (!alert.expires_at) return true;

      return new Date(alert.expires_at).getTime() > Date.now();
    });

    if (normalized.includes("expires_at") || normalized.includes("is_active")) {
      return { rows: activeAlerts, rowCount: activeAlerts.length };
    }

    return {
      rows: fallbackStore.alerts,
      rowCount: fallbackStore.alerts.length,
    };
  }

  return { rows: [], rowCount: 0 };
}

const INIT_DDL = `
  CREATE TABLE IF NOT EXISTS resq_users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    institution VARCHAR(255),
    department VARCHAR(255),
    year_of_study VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    preparedness_score INT DEFAULT 0,
    certificates INT DEFAULT 0,
    avatar VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  ALTER TABLE resq_users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);
  ALTER TABLE resq_users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) NOT NULL DEFAULT 'password';
  CREATE UNIQUE INDEX IF NOT EXISTS resq_users_google_id_key ON resq_users(google_id) WHERE google_id IS NOT NULL;

  DO $$
  BEGIN
    ALTER TABLE resq_users DROP CONSTRAINT IF EXISTS resq_users_role_check;
    ALTER TABLE resq_users ADD CONSTRAINT resq_users_role_check
      CHECK (role IN ('student', 'faculty', 'admin'));
  EXCEPTION
    WHEN undefined_table THEN NULL;
  END $$;

  CREATE TABLE IF NOT EXISTS resq_courses (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'Flood',
    thumbnail TEXT,
    difficulty VARCHAR(50) DEFAULT 'Beginner',
    duration VARCHAR(50) NOT NULL DEFAULT '30 min',
    icon_name VARCHAR(50) NOT NULL DEFAULT 'Droplet',
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS resq_lessons (
    id SERIAL PRIMARY KEY,
    lesson_id VARCHAR(100) NOT NULL,
    course_id INT NOT NULL REFERENCES resq_courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL DEFAULT 'document',
    content TEXT NOT NULL,
    order_index INT NOT NULL DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, lesson_id)
  );

  CREATE TABLE IF NOT EXISTS resq_materials (
    id SERIAL PRIMARY KEY,
    lesson_id INT NOT NULL REFERENCES resq_lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    url TEXT NOT NULL,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS resq_user_course_progress (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES resq_users(id) ON DELETE CASCADE,
    course_id INT NOT NULL REFERENCES resq_courses(id) ON DELETE CASCADE,
    progress_percent INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'in-progress',
    completed BOOLEAN DEFAULT FALSE,
    completed_lesson_ids JSONB DEFAULT '[]'::jsonb,
    last_accessed_lesson_id VARCHAR(100),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id)
  );

  CREATE TABLE IF NOT EXISTS resq_user_lesson_progress (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES resq_users(id) ON DELETE CASCADE,
    lesson_id INT NOT NULL REFERENCES resq_lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id)
  );

  CREATE TABLE IF NOT EXISTS resq_quizzes (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    difficulty VARCHAR(50) NOT NULL DEFAULT 'Medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS resq_quiz_questions (
    id SERIAL PRIMARY KEY,
    question_id VARCHAR(100) NOT NULL,
    quiz_id INT NOT NULL REFERENCES resq_quizzes(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer_index INT NOT NULL,
    explanation TEXT NOT NULL,
    order_index INT NOT NULL DEFAULT 0,
    UNIQUE(quiz_id, question_id)
  );

  CREATE TABLE IF NOT EXISTS resq_quiz_attempts (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES resq_users(id) ON DELETE CASCADE,
    quiz_id INT NOT NULL REFERENCES resq_quizzes(id) ON DELETE CASCADE,
    score INT NOT NULL,
    total INT NOT NULL,
    passed BOOLEAN NOT NULL DEFAULT FALSE,
    answers JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS resq_alerts (
    id SERIAL PRIMARY KEY,
    alert_id VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(50) NOT NULL DEFAULT 'Medium' CHECK (severity IN ('Critical', 'High', 'Medium', 'Low')),
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
  ALTER TABLE resq_alerts ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
  DO $$
  BEGIN
    ALTER TABLE resq_alerts DROP CONSTRAINT IF EXISTS resq_alerts_severity_check;
    ALTER TABLE resq_alerts ADD CONSTRAINT resq_alerts_severity_check
      CHECK (severity IN ('Critical', 'High', 'Medium', 'Low'));
  EXCEPTION
    WHEN undefined_table THEN NULL;
  END $$;

  CREATE TABLE IF NOT EXISTS resq_user_alert_reads (
    user_id INT NOT NULL REFERENCES resq_users(id) ON DELETE CASCADE,
    alert_id INT NOT NULL REFERENCES resq_alerts(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, alert_id)
  );

  CREATE TABLE IF NOT EXISTS resq_chat_messages (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES resq_users(id) ON DELETE CASCADE,
    sender VARCHAR(20) NOT NULL CHECK (sender IN ('user', 'bot')),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS resq_emergency_places (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    address TEXT,
    phone VARCHAR(100),
    disaster_types TEXT[] DEFAULT ARRAY['General Emergency']::TEXT[],
    capacity INT,
    verified BOOLEAN DEFAULT FALSE,
    available BOOLEAN DEFAULT TRUE,
    source VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
`;

let schemaInitPromise: Promise<void> | null = null;

export async function ensureSchema() {
  if (!schemaInitPromise) {
    schemaInitPromise = (async () => {
      try {
        await pool.query(INIT_DDL);
        await pool.query(`
          INSERT INTO resq_users (name, email, password_hash, role, institution, department, status)
          VALUES (
            'SafeGraph Admin',
            'admin@safegraph.ai',
            '$2b$10$pyQzPCY/F7XBaX7VKRA.fuE6jBXeKxwp9iECTXPn37BcQqGZSyoQy',
            'admin',
            'SafeGraph AI Command',
            'Administration',
            'Active'
          )
          ON CONFLICT (email) DO NOTHING;
        `);
      } catch (e) {
        console.error("Auto schema initialization warning:", e);
      }
    })();
  }

  return schemaInitPromise;
}

export async function query(text: string, params?: any[]) {
  try {
    return await pool.query(text, params);
  } catch (err: any) {
    if (
      ["42P01", "42703", "23514"].includes(err?.code) &&
      text.toLowerCase().includes("resq_alerts")
    ) {
      console.warn("Alert schema mismatch, executing automatic schema upgrade...");
      try {
        await ensureSchema();

        return await pool.query(text, params);
      } catch (schemaErr) {
        console.error("Schema creation failed:", schemaErr);
      }
    }

    throw err;
  }
}
