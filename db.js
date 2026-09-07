const { Pool } = require("pg");
require("dotenv").config();

const DEFAULT_DATABASE_URL =
  "postgresql://neondb_owner:npg_DVlcze2Gt4iC@ep-rapid-bird-ae4xdzo8-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  DEFAULT_DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

module.exports = pool;

