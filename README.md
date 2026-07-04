# Hospital Connectivity — Backend API

Express + PostgreSQL REST API for the Hospital Connectivity System. Built to match the frontend's data shapes exactly, so the two plug together with no reshaping.

## Setup

1. **Install PostgreSQL** locally (or use a hosted instance like Neon/Supabase/Render).
2. **Create the database:**
   ```bash
   createdb hospital_connectivity
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your actual PostgreSQL credentials and a real `JWT_SECRET`.

5. **Create tables and seed doctors:**
   ```bash
   npm run db:init
   ```

6. **Start the server:**
   ```bash
   npm run dev
   ```
   API runs at `http://localhost:5000`. Check `http://localhost:5000/api/health` to confirm it's up.

## Connecting the frontend

In your React frontend, replace the `TODO` comments in `Login.jsx`, `Patients.jsx`, and `Appointments.jsx` with real `fetch` calls to these endpoints. Store the JWT token from login (e.g. in memory or `sessionStorage` in a real deployment) and send it as `Authorization: Bearer <token>` on every request.

## API Reference

### Auth
| Method | Endpoint | Body | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | `{ name, email, password, role }` | — |
| POST | `/api/auth/login` | `{ email, password }` | — |
| GET | `/api/auth/me` | — | Bearer token |

### Patients
| Method | Endpoint | Body | Roles |
|---|---|---|---|
| GET | `/api/patients?search=` | — | any logged-in user |
| GET | `/api/patients/:mrn` | — | any logged-in user |
| POST | `/api/patients` | `{ name, age, gender, phone, condition }` | Admin, Receptionist |
| PATCH | `/api/patients/:mrn` | any patient field | Admin, Receptionist, Doctor |
| DELETE | `/api/patients/:mrn` | — | Admin |

### Appointments
| Method | Endpoint | Body | Roles |
|---|---|---|---|
| GET | `/api/appointments?status=&date=` | — | any logged-in user |
| POST | `/api/appointments` | `{ mrn, doctorName, date, time }` | Admin, Receptionist |
| PATCH | `/api/appointments/:apptCode/status` | `{ status }` | Admin, Receptionist, Doctor |

### Doctors
| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/doctors` | any logged-in user |

## Notes

- Passwords are hashed with bcrypt before storage — never stored in plain text.
- JWTs expire after 8 hours by default (`JWT_EXPIRES_IN` in `.env`).
- MRNs (`MRN-20394`) and appointment codes (`APT-1042`) auto-increment to match the format already used in the frontend mock data.
- CORS is locked to `CLIENT_ORIGIN` — update this when you deploy the frontend to Vercel.
