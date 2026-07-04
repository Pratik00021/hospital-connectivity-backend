// Generates the next sequential MRN / appointment code,
// matching the format already used in the frontend (MRN-20394, APT-1042).

export async function nextMrn(pool) {
  const { rows } = await pool.query(
    `SELECT mrn FROM patients ORDER BY id DESC LIMIT 1`
  );
  if (rows.length === 0) return "MRN-20394";
  const lastNum = parseInt(rows[0].mrn.split("-")[1], 10);
  return `MRN-${lastNum + 1}`;
}

export async function nextApptCode(pool) {
  const { rows } = await pool.query(
    `SELECT appt_code FROM appointments ORDER BY id DESC LIMIT 1`
  );
  if (rows.length === 0) return "APT-1042";
  const lastNum = parseInt(rows[0].appt_code.split("-")[1], 10);
  return `APT-${lastNum + 1}`;
}
