// Runs schema.sql against the configured PostgreSQL database.
// Usage: npm run db:init

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../config/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function initDb() {
  const schemaPath = path.join(__dirname, "..", "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf-8");

  try {
    await pool.query(sql);
    console.log("✅ Database schema created and seeded successfully.");
  } catch (err) {
    console.error("❌ Failed to initialize database:", err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

initDb();
