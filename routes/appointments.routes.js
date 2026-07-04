import { Router } from "express";
import {
  listAppointments,
  createAppointment,
  updateAppointmentStatus,
} from "../controllers/appointmentController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", listAppointments);
router.post("/", requireRole("Admin", "Receptionist"), createAppointment);
router.patch("/:apptCode/status", requireRole("Admin", "Receptionist", "Doctor"), updateAppointmentStatus);

export default router;
