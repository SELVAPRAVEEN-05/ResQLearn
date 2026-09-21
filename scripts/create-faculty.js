const bcrypt = require("bcryptjs");
const pool = require("../db");

const facultyEmail = "faculty.demo@safegraph.ai";
const facultyPassword = process.env.FACULTY_DEMO_PASSWORD;

async function createFaculty() {
  if (!facultyPassword || facultyPassword.length < 8) {
    throw new Error("Set FACULTY_DEMO_PASSWORD to a value of at least 8 characters.");
  }

  const passwordHash = await bcrypt.hash(facultyPassword, 10);
  await pool.query("ALTER TABLE resq_users DROP CONSTRAINT IF EXISTS resq_users_role_check");
  await pool.query(
    "ALTER TABLE resq_users ADD CONSTRAINT resq_users_role_check CHECK (role IN ('student', 'faculty', 'admin'))",
  );

  const result = await pool.query(
    `
      INSERT INTO resq_users
        (name, email, password_hash, role, institution, department, year_of_study, status)
      VALUES
        ('Faculty Demo', $1, $2, 'faculty', 'SafeGraph AI', 'Disaster Management', 'Faculty', 'Active')
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        password_hash = EXCLUDED.password_hash,
        role = 'faculty',
        institution = EXCLUDED.institution,
        department = EXCLUDED.department,
        year_of_study = EXCLUDED.year_of_study,
        status = 'Active'
      RETURNING id, name, email, role, status
    `,
    [facultyEmail, passwordHash],
  );

  console.log("Faculty account provisioned:", result.rows[0]);
}

createFaculty()
  .catch((error) => {
    console.error("Faculty account provisioning failed:", {
      code: error.code,
      message: error.message,
    });
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
