const { Pool } = require("pg");
require("dotenv").config();

const RAW_DATABASE_URL =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  "postgresql://neondb_owner:npg_DVlcze2Gt4iC@ep-rapid-bird-ae4xdzo8-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require";

const sanitizedConnectionString = RAW_DATABASE_URL
  .replace(/[?&]channel_binding=[^&]+/g, "")
  .replace(/[?&]sslmode=[^&]+/g, "");

const pool = new Pool({
  connectionString: sanitizedConnectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on("error", (err) => {
  console.warn("Unexpected idle client error in pg pool:", err.message);
});

module.exports = pool;


