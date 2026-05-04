import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { getCustomers } from "../controllers/customer.controller.js";

const router = Router();
router.use(authMiddleware, roleMiddleware("ADMIN", "AGENT"));
router.get("/", getCustomers);

export default router;
