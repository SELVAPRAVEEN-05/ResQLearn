const pool = require("../db");
const bcrypt = require("bcryptjs");

async function setAdminPassword() {
  try {
    const adminHash = await bcrypt.hash("admin123", 10);
    console.log("Generated hash for 'admin123':", adminHash);

    // Update existing admin user or insert
    const updateRes = await pool.query(
      "UPDATE resq_users SET password_hash = $1 WHERE role = 'admin' OR email = 'admin@safegraph.ai' RETURNING id, name, email, role",
      [adminHash]
    );

    if (updateRes.rows.length === 0) {
      const insertRes = await pool.query(
        "INSERT INTO resq_users (name, email, password_hash, role, institution, department, status) VALUES ('SafeGraph Admin', 'admin@safegraph.ai', $1, 'admin', 'SafeGraph AI', 'Admin', 'Active') RETURNING id, name, email, role",
        [adminHash]
      );
      console.log("Created admin user:", insertRes.rows[0]);
    } else {
      console.log("Updated admin user(s):", updateRes.rows);
    }

    const verify = await bcrypt.compare("admin123", adminHash);
    console.log("Verified 'admin123' against hash:", verify);
  } catch (err) {
    console.error("Error setting admin password:", err);
  } finally {
    await pool.end();
  }
}

setAdminPassword();
