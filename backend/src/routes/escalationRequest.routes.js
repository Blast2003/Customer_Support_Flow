import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import {
  createEscalation,
  getEscalations,
  updateEscalation,
} from "../controllers/escalation.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/", roleMiddleware("ADMIN", "AGENT"), getEscalations);
router.post("/", roleMiddleware("ADMIN", "AGENT"), createEscalation);
router.patch("/:id", roleMiddleware("ADMIN"), updateEscalation);

export default router;