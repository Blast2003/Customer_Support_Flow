import { Op } from "sequelize";
import TicketMessage from "../models/TicketMessage.js";
import Ticket from "../models/Ticket.js";

export const registerTicketSocketEvents = ({ io, socket, userSocketMap }) => {
  socket.on("ticket:markSeen", async ({ ticketId, viewerId, viewerRole }) => {
    try {
      const ticket = await Ticket.findByPk(ticketId);
      if (!ticket || !viewerId) return;

      await TicketMessage.update(
        { seen: true },
        {
          where: {
            ticketId,
            seen: false,
            senderId: {
              [Op.ne]: viewerId,
            },
          },
        }
      );

      const counterpartId =
        String(ticket.customerId) === String(viewerId) ? ticket.agentId : ticket.customerId;

      const counterpartSocketId = counterpartId ? userSocketMap[String(counterpartId)] : null;

      if (counterpartSocketId) {
        io.to(counterpartSocketId).emit("ticket:messagesSeen", {
          ticketId,
          seenBy: viewerId,
        });
      }

      if (viewerRole === "AGENT" && ticket.status === "OPEN") {
        await Ticket.update({ status: "IN_PROGRESS" }, { where: { id: ticketId } });
      }
    } catch (error) {
      console.error("ticket:markSeen error:", error.message);
    }
  });
};