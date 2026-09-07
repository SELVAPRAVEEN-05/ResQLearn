const pool = require("../db");

async function initDB() {
  console.log("🚀 Initializing/Upgrading PostgreSQL Database Schema for SafeGraph AI / ResQLearn...");

  const ddlQuery = `
    -- 1. Users Table
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

    -- 2. Courses Table
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

    -- Alter courses if columns do not exist
    ALTER TABLE resq_courses ADD COLUMN IF NOT EXISTS thumbnail TEXT;
    ALTER TABLE resq_courses ADD COLUMN IF NOT EXISTS difficulty VARCHAR(50) DEFAULT 'Beginner';
    ALTER TABLE resq_courses ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE;
    ALTER TABLE resq_courses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

    -- Drop legacy category check if exists to support all disaster types
    DO $$ 
    BEGIN
      ALTER TABLE resq_courses DROP CONSTRAINT IF EXISTS resq_courses_category_check;
    EXCEPTION
      WHEN others THEN NULL;
    END $$;

    -- 3. Lessons Table
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

    ALTER TABLE resq_lessons ADD COLUMN IF NOT EXISTS description TEXT;
    ALTER TABLE resq_lessons ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;
    ALTER TABLE resq_lessons ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

    -- 4. Materials Table (Educational Materials)
    CREATE TABLE IF NOT EXISTS resq_materials (
      id SERIAL PRIMARY KEY,
      lesson_id INT NOT NULL REFERENCES resq_lessons(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      type VARCHAR(50) NOT NULL CHECK (type IN ('PDF', 'VIDEO', 'WEBSITE', 'ARTICLE', 'IMAGE', 'DOCUMENT', 'EXTERNAL_RESOURCE')),
      url TEXT NOT NULL,
      order_index INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- 5. User Course Progress Table
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

    ALTER TABLE resq_user_course_progress ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;
    ALTER TABLE resq_user_course_progress ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE resq_user_course_progress ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

    -- 6. User Lesson Progress Table
    CREATE TABLE IF NOT EXISTS resq_user_lesson_progress (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES resq_users(id) ON DELETE CASCADE,
      lesson_id INT NOT NULL REFERENCES resq_lessons(id) ON DELETE CASCADE,
      completed BOOLEAN DEFAULT FALSE,
      completed_at TIMESTAMP WITH TIME ZONE,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, lesson_id)
    );

    -- 6b. User Material Progress Table (Granular Material Completion Tracking)
    CREATE TABLE IF NOT EXISTS resq_user_material_progress (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES resq_users(id) ON DELETE CASCADE,
      material_id INT NOT NULL REFERENCES resq_materials(id) ON DELETE CASCADE,
      completed BOOLEAN DEFAULT FALSE,
      progress_percent INT DEFAULT 0,
      completed_at TIMESTAMP WITH TIME ZONE,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, material_id)
    );

    -- 7. Quizzes Table
    CREATE TABLE IF NOT EXISTS resq_quizzes (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(100) UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(50) NOT NULL,
      difficulty VARCHAR(50) NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- 8. Quiz Questions Table
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

    -- 9. Quiz Attempts Table
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

    -- 10. Alerts Table
    CREATE TABLE IF NOT EXISTS resq_alerts (
      id SERIAL PRIMARY KEY,
      alert_id VARCHAR(100) UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      severity VARCHAR(50) NOT NULL CHECK (severity IN ('High', 'Medium', 'Low')),
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- 11. User Alert Reads Table
    CREATE TABLE IF NOT EXISTS resq_user_alert_reads (
      user_id INT NOT NULL REFERENCES resq_users(id) ON DELETE CASCADE,
      alert_id INT NOT NULL REFERENCES resq_alerts(id) ON DELETE CASCADE,
      read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY(user_id, alert_id)
    );

    -- 12. Chat Messages Table
    CREATE TABLE IF NOT EXISTS resq_chat_messages (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES resq_users(id) ON DELETE CASCADE,
      sender VARCHAR(20) NOT NULL CHECK (sender IN ('user', 'bot')),
      message TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_resq_users_email ON resq_users(email);
    CREATE INDEX IF NOT EXISTS idx_resq_courses_slug ON resq_courses(slug);
    CREATE INDEX IF NOT EXISTS idx_resq_courses_published ON resq_courses(is_published);
    CREATE INDEX IF NOT EXISTS idx_resq_courses_category ON resq_courses(category);
    CREATE INDEX IF NOT EXISTS idx_resq_lessons_course_id ON resq_lessons(course_id);
    CREATE INDEX IF NOT EXISTS idx_resq_lessons_order ON resq_lessons(order_index);
    CREATE INDEX IF NOT EXISTS idx_resq_materials_lesson_id ON resq_materials(lesson_id);
    CREATE INDEX IF NOT EXISTS idx_resq_materials_order ON resq_materials(order_index);
    CREATE INDEX IF NOT EXISTS idx_resq_user_course_progress_user ON resq_user_course_progress(user_id);
    CREATE INDEX IF NOT EXISTS idx_resq_user_course_progress_course ON resq_user_course_progress(course_id);
    CREATE INDEX IF NOT EXISTS idx_resq_user_lesson_progress_user ON resq_user_lesson_progress(user_id);
    CREATE INDEX IF NOT EXISTS idx_resq_user_lesson_progress_lesson ON resq_user_lesson_progress(lesson_id);
    CREATE INDEX IF NOT EXISTS idx_resq_quizzes_slug ON resq_quizzes(slug);
    CREATE INDEX IF NOT EXISTS idx_resq_quiz_questions_quiz_id ON resq_quiz_questions(quiz_id);
    CREATE INDEX IF NOT EXISTS idx_resq_quiz_attempts_user ON resq_quiz_attempts(user_id);
    CREATE INDEX IF NOT EXISTS idx_resq_alerts_active ON resq_alerts(is_active);
    CREATE INDEX IF NOT EXISTS idx_resq_chat_messages_user ON resq_chat_messages(user_id);
  `;

  try {
    await pool.query(ddlQuery);
    console.log("✅ All ResQLearn PostgreSQL tables and indexes created/upgraded successfully!");
  } catch (error) {
    console.error("❌ Failed to initialize database:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDB();
