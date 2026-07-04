import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const isLocal = process.env.PGHOST === "localhost" || process.env.PGHOST === "127.0.0.1";

const pool = new pg.Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL error on idle client", err);
  process.exit(1);
});

export default pool;