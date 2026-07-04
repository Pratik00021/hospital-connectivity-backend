import pool from "../config/db.js";
import { nextMrn } from "../utils/idGenerator.js";

function toApiShape(row) {
  return {
    id: row.mrn,
    name: row.name,
    age: row.age,
    gender: row.gender,
    phone: row.phone,
    lastVisit: row.last_visit,
    condition: row.condition,
    status: row.status,
  };
}

// GET /api/patients
export async function listPatients(req, res, next) {
  try {
    const { search } = req.query;
    let query = `SELECT * FROM patients`;
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` WHERE name ILIKE $1 OR mrn ILIKE $1`;
    }
    query += ` ORDER BY created_at DESC`;

    const { rows } = await pool.query(query, params);
    res.json(rows.map(toApiShape));
  } catch (err) {
    next(err);
  }
}

// GET /api/patients/:mrn
export async function getPatient(req, res, next) {
  try {
    const { rows } = await pool.query(`SELECT * FROM patients WHERE mrn = $1`, [req.params.mrn]);
    if (rows.length === 0) return res.status(404).json({ error: "Patient not found." });
    res.json(toApiShape(rows[0]));
  } catch (err) {
    next(err);
  }
}

// POST /api/patients
export async function createPatient(req, res, next) {
  try {
    const { name, age, gender, phone, condition } = req.body;
    if (!name || !age || !gender || !phone) {
      return res.status(400).json({ error: "name, age, gender, and phone are required." });
    }

    const mrn = await nextMrn(pool);
    const { rows } = await pool.query(
      `INSERT INTO patients (mrn, name, age, gender, phone, condition, status, last_visit)
       VALUES ($1, $2, $3, $4, $5, $6, 'Active', CURRENT_DATE)
       RETURNING *`,
      [mrn, name, age, gender, phone, condition || null]
    );

    res.status(201).json(toApiShape(rows[0]));
  } catch (err) {
    next(err);
  }
}

// PATCH /api/patients/:mrn
export async function updatePatient(req, res, next) {
  try {
    const { name, age, gender, phone, condition, status } = req.body;
    const { rows } = await pool.query(
      `UPDATE patients SET
         name = COALESCE($1, name),
         age = COALESCE($2, age),
         gender = COALESCE($3, gender),
         phone = COALESCE($4, phone),
         condition = COALESCE($5, condition),
         status = COALESCE($6, status)
       WHERE mrn = $7
       RETURNING *`,
      [name, age, gender, phone, condition, status, req.params.mrn]
    );

    if (rows.length === 0) return res.status(404).json({ error: "Patient not found." });
    res.json(toApiShape(rows[0]));
  } catch (err) {
    next(err);
  }
}

// DELETE /api/patients/:mrn
export async function deletePatient(req, res, next) {
  try {
    const { rowCount } = await pool.query(`DELETE FROM patients WHERE mrn = $1`, [req.params.mrn]);
    if (rowCount === 0) return res.status(404).json({ error: "Patient not found." });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
