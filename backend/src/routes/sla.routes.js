import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { getSLA, getSlaSummary } from "../controllers/sla.controller.js";

const router = Router();

router.use(authMiddleware);
router.get("/", roleMiddleware("ADMIN", "AGENT", "CUSTOMER"), getSLA);
router.get("/summary", roleMiddleware("ADMIN", "AGENT", "CUSTOMER"), getSlaSummary);

export default router;