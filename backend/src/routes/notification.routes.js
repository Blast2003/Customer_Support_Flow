import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notification.controller.js";

const router = Router();

router.use(authMiddleware);
router.get("/", getMyNotifications);
router.patch("/:id/read", markAsRead);
router.patch("/read-all", markAllAsRead);

export default router;