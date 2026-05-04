import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getAdminReport } from "../controllers/report.controller.js";

const router = Router();

router.use(authMiddleware);
router.get("/", getAdminReport);

export default router;