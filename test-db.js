const pool = require("./db");

async function testConnection() {
  try {
    const result = await pool.query(`
      SELECT
        1 AS connected,
        current_database() AS database_name,
        current_schema() AS schema_name,
        to_regclass('public.resq_users') AS users_table
    `);

    console.log("Database connected.");
    console.log({
      connected: result.rows[0].connected,
      database: result.rows[0].database_name,
      schema: result.rows[0].schema_name,
      usersTable: result.rows[0].users_table,
    });
  } catch (error) {
    console.error("Database connection/schema check failed:", {
      code: error.code,
      message: error.message,
    });
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

testConnection();
