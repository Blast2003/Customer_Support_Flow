import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  addMessage,
  resolveTicket,
  escalateTicket,
  markTicketRead
} from "../controllers/ticket.controller.js";

const router = Router();

router.use(authMiddleware);
router.get("/", getTickets);
router.get("/:id", getTicketById);
router.post("/", roleMiddleware("ADMIN", "AGENT", "CUSTOMER"), createTicket);
router.patch("/:id", roleMiddleware("ADMIN", "AGENT"), updateTicket);
router.post("/:id/messages", addMessage);
router.post("/:id/resolve", roleMiddleware("ADMIN", "AGENT"), resolveTicket);
router.post("/:id/escalate", roleMiddleware("AGENT", "ADMIN"), escalateTicket);
router.post("/:id/read", markTicketRead);

export default router;