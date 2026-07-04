import { Router } from "express";
import {
  listPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
} from "../controllers/patientController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", listPatients);
router.get("/:mrn", getPatient);
router.post("/", requireRole("Admin", "Receptionist"), createPatient);
router.patch("/:mrn", requireRole("Admin", "Receptionist", "Doctor"), updatePatient);
router.delete("/:mrn", requireRole("Admin"), deletePatient);

export default router;
