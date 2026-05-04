import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { getUsers, updateUser, getAgents } from "../controllers/user.controller.js";

const router = Router();

router.use(authMiddleware);
router.get("/", roleMiddleware("ADMIN"), getUsers);
router.get("/agents", roleMiddleware("ADMIN"), getAgents);
router.patch("/:id", roleMiddleware("ADMIN"), updateUser);

export default router;