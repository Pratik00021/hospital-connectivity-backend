import pool from "../config/db.js";
import { nextApptCode } from "../utils/idGenerator.js";

const SELECT_JOIN = `
  SELECT
    a.appt_code AS id,
    p.name      AS patient,
    p.mrn       AS mrn,
    d.name      AS doctor,
    d.department AS department,
    a.appt_date AS date,
    a.appt_time AS time,
    a.status    AS status
  FROM appointments a
  JOIN patients p ON p.id = a.patient_id
  JOIN doctors  d ON d.id = a.doctor_id
`;

// GET /api/appointments?status=&date=
export async function listAppointments(req, res, next) {
  try {
    const { status, date } = req.query;
    const conditions = [];
    const params = [];

    if (status && status !== "All") {
      params.push(status);
      conditions.push(`a.status = $${params.length}`);
    }
    if (date) {
      params.push(date);
      conditions.push(`a.appt_date = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const { rows } = await pool.query(
      `${SELECT_JOIN} ${where} ORDER BY a.appt_date DESC, a.appt_time DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// POST /api/appointments
// body: { mrn, doctorName, date, time }
export async function createAppointment(req, res, next) {
  try {
    const { mrn, doctorName, date, time } = req.body;
    if (!mrn || !doctorName || !date || !time) {
      return res.status(400).json({ error: "mrn, doctorName, date, and time are required." });
    }

    const patientResult = await pool.query(`SELECT id FROM patients WHERE mrn = $1`, [mrn]);
    if (patientResult.rows.length === 0) {
      return res.status(404).json({ error: "Patient not found for the given MRN." });
    }
    const doctorResult = await pool.query(`SELECT id FROM doctors WHERE name = $1`, [doctorName]);
    if (doctorResult.rows.length === 0) {
      return res.status(404).json({ error: "Doctor not found." });
    }

    const apptCode = await nextApptCode(pool);
    const insert = await pool.query(
      `INSERT INTO appointments (appt_code, patient_id, doctor_id, appt_date, appt_time, status)
       VALUES ($1, $2, $3, $4, $5, 'Scheduled')
       RETURNING id`,
      [apptCode, patientResult.rows[0].id, doctorResult.rows[0].id, date, time]
    );

    const { rows } = await pool.query(`${SELECT_JOIN} WHERE a.id = $1`, [insert.rows[0].id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/appointments/:apptCode/status
// body: { status: "Cancelled" | "Completed" | "In Progress" | "Scheduled" }
export async function updateAppointmentStatus(req, res, next) {
  try {
    const { status } = req.body;
    const allowed = ["Scheduled", "In Progress", "Completed", "Cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `status must be one of ${allowed.join(", ")}` });
    }

    const { rows } = await pool.query(
      `UPDATE appointments SET status = $1 WHERE appt_code = $2 RETURNING id`,
      [status, req.params.apptCode]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Appointment not found." });

    const result = await pool.query(`${SELECT_JOIN} WHERE a.id = $1`, [rows[0].id]);
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}
