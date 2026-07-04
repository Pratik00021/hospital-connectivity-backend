import { Router } from "express";
import { listDoctors } from "../controllers/doctorController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, listDoctors);

export default router;
