-- Hospital Connectivity System — PostgreSQL schema
-- Run with: psql -U postgres -d hospital_connectivity -f schema.sql

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(160) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          VARCHAR(20) NOT NULL CHECK (role IN ('Admin', 'Doctor', 'Receptionist')),
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS doctors (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  name        VARCHAR(120) NOT NULL,
  department  VARCHAR(80) NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patients (
  id            SERIAL PRIMARY KEY,
  mrn           VARCHAR(20) UNIQUE NOT NULL,        -- e.g. MRN-20394
  name          VARCHAR(120) NOT NULL,
  age           INTEGER NOT NULL CHECK (age >= 0),
  gender        VARCHAR(20) NOT NULL,
  phone         VARCHAR(20) NOT NULL,
  condition     VARCHAR(160),
  status        VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Discharged')),
  last_visit    DATE,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS appointments (
  id            SERIAL PRIMARY KEY,
  appt_code     VARCHAR(20) UNIQUE NOT NULL,         -- e.g. APT-1042
  patient_id    INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id     INTEGER NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
  appt_date     DATE NOT NULL,
  appt_time     TIME NOT NULL,
  status        VARCHAR(20) NOT NULL DEFAULT 'Scheduled'
                CHECK (status IN ('Scheduled', 'In Progress', 'Completed', 'Cancelled')),
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appt_date);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_patients_mrn ON patients(mrn);

-- Seed doctors so the appointment-booking dropdown has data on first run
INSERT INTO doctors (name, department) VALUES
  ('Dr. Kavita Rao', 'Cardiology'),
  ('Dr. Sameer Joshi', 'Endocrinology'),
  ('Dr. Anjali Verma', 'Obstetrics'),
  ('Dr. Rahul Bhosale', 'General Medicine'),
  ('Dr. Neha Iyer', 'Orthopedics')
ON CONFLICT DO NOTHING;
