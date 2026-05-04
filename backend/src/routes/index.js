import { Router } from "express";

import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import customerRoutes from "./customer.routes.js";
import ticketRoutes from "./ticket.routes.js";
import complaintRoutes from "./complaint.routes.js";
import slaRoutes from "./sla.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import notificationRoutes from "./notification.routes.js";
import reportRoutes from "./report.routes.js";
import escalationRoutes from "./escalationRequest.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/customers", customerRoutes);
router.use("/tickets", ticketRoutes);
router.use("/complaints", complaintRoutes);
router.use("/sla", slaRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/notifications", notificationRoutes);
router.use("/reports", reportRoutes);
router.use("/escalations", escalationRoutes);

export default router;