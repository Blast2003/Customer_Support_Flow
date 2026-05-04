import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import {
  createComplaint,
  getComplaints,
  updateComplaint,
} from "../controllers/complaint.controller.js";

const router = Router();

router.use(authMiddleware);

// everyone logged in can list, service will filter by role
router.get("/", getComplaints);

// customers create complaints
router.post("/", roleMiddleware("CUSTOMER"), createComplaint);

// admin handles resolution
router.patch("/:id", roleMiddleware("ADMIN"), updateComplaint);

export default router;