import { Pool } from "pg";

let pool: Pool;

declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

if (process.env.NODE_ENV === "production") {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  if (!global._pgPool) {
    global._pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }
  pool = global._pgPool;
}

export default pool;
export const query = (text: string, params?: any[]) => pool.query(text, params);
