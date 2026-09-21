const { Pool } = require("pg");
require("dotenv").config();

const RAW_DATABASE_URL =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  "";

const sanitizedConnectionString = RAW_DATABASE_URL
  .replace(/[?&]channel_binding=[^&]+/g, "");

const rawPool = new Pool({
  connectionString: sanitizedConnectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 3000,
});

rawPool.on("error", (err) => {
  console.warn("Unexpected idle client error in pg pool:", err.message);
});

module.exports = rawPool;



