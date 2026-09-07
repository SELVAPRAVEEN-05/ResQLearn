const pool = require("../db");
const bcrypt = require("bcryptjs");

async function checkAndFixUser() {
  try {
    const res = await pool.query("SELECT id, email, password_hash, role, status FROM resq_users");
    console.log("All users in database:", res.rows);

    const hash = await bcrypt.hash("bitsathy", 10);
    const updateRes = await pool.query(
      `
      INSERT INTO resq_users (name, email, password_hash, role, institution, department, year_of_study, preparedness_score, certificates, status)
      VALUES ('Prasanth', 'prasanth@gmail.com', $1, 'student', 'Bannari Amman Institute of Technology (BIT)', 'Computer Science & Engineering', '3rd Year', 80, 2, 'Active')
      ON CONFLICT (email) DO UPDATE SET
        password_hash = $1,
        status = 'Active'
      RETURNING id, email, role, status;
      `,
      [hash]
    );
    console.log("Updated/Ensured prasanth@gmail.com:", updateRes.rows[0]);

    // Test verify
    const verifyUser = await pool.query("SELECT * FROM resq_users WHERE email = 'prasanth@gmail.com'");
    const isMatch = await bcrypt.compare("bitsathy", verifyUser.rows[0].password_hash);
    console.log("Verification of 'bitsathy' against stored hash:", isMatch);
  } catch (err) {
    console.error("DB error:", err);
  } finally {
    await pool.end();
  }
}

checkAndFixUser();
