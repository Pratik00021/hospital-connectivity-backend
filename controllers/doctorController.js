import pool from "../config/db.js";

// GET /api/doctors
export async function listDoctors(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT name, department FROM doctors ORDER BY name ASC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}
