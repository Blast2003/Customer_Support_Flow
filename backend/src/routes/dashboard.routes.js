import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getDashboard } from "../controllers/dashboard.controller.js";

const router = Router();

// customer, agent, admin can all read their own dashboard summary
router.use(authMiddleware);
router.get("/", getDashboard);

export default router;