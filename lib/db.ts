import { Pool } from "pg";

const DEFAULT_DATABASE_URL =
  "postgresql://neondb_owner:npg_DVlcze2Gt4iC@ep-rapid-bird-ae4xdzo8-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  DEFAULT_DATABASE_URL;

declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

// Serverless-friendly global pool singleton
if (!global._pgPool) {
  global._pgPool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
}

const pool: Pool = global._pgPool;

export default pool;

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
    severity VARCHAR(50) NOT NULL DEFAULT 'Medium',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS resq_chat_messages (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES resq_users(id) ON DELETE CASCADE,
    sender VARCHAR(20) NOT NULL CHECK (sender IN ('user', 'bot')),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
`;

let schemaInitPromise: Promise<void> | null = null;

async function ensureSchema() {
  if (!schemaInitPromise) {
    schemaInitPromise = (async () => {
      try {
        await pool.query(INIT_DDL);
        // Ensure default admin user exists
        await pool.query(`
          INSERT INTO resq_users (name, email, password_hash, role, institution, department, status)
          VALUES (
            'SafeGraph Admin',
            'admin@safegraph.ai',
            '$2b$10$vGcK7SD0AA1/zHv0eUBLn.HfpFXfkCgdPYdpjReyRSgVJDyrNzhH6',
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
    // If relation does not exist (code 42P01), auto-initialize and retry once
    if (err?.code === "42P01") {
      console.warn("Table missing, executing automatic schema creation...");
      await ensureSchema();
      return await pool.query(text, params);
    }

    console.error("Database query execution error:", {
      message: err?.message,
      code: err?.code,
      query: text.slice(0, 100),
    });
    throw err;
  }
}


