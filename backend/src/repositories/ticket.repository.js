import { Op } from "sequelize";
import { Ticket, TicketMessage, Complaint, EscalationRequest } from "../models/index.js";
import { sequelize } from "../config/db.js";

const unreadCountLiteral = (currentUserId) =>
  sequelize.literal(`(
    SELECT COUNT(*)
    FROM ticket_messages tm
    WHERE tm.ticketId = Ticket.id
      AND tm.seen = false
      AND tm.senderId <> ${sequelize.escape(currentUserId)}
  )`);

const ticketDetailInclude = [
  { association: "customer" },
  { association: "agent" },
  { association: "slaRecord" },
  {
    association: "messages",
    separate: true,
    required: false,
    order: [["createdAt", "ASC"]],
    include: [{ association: "sender" }],
  },
];

// Lightweight ticket list item
export const findTicketById = (id) =>
  Ticket.findByPk(id, {
    include: ticketDetailInclude,
  });

// Messages (paginated)
export const findTicketMessages = ({ ticketId, limit, offset }) =>
  TicketMessage.findAndCountAll({
    where: { ticketId },
    include: [{ association: "sender" }],
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });

// Complaints
export const findTicketComplaints = ({ ticketId, limit, offset }) =>
  Complaint.findAndCountAll({
    where: { ticketId },
    include: [{ association: "creator" }, { association: "customer" }],
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });

// Escalations
export const findTicketEscalations = ({ ticketId, limit, offset }) =>
  EscalationRequest.findAndCountAll({
    where: { ticketId },
    include: [
      { association: "creator" },
      { association: "handler" },
      { association: "targetUser" },
    ],
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });

// Existing list query
export const findTickets = ({
  where = {},
  limit,
  offset,
  order = [["createdAt", "DESC"]],
  currentUser = null,
} = {}) =>
  Ticket.findAndCountAll({
    where,
    limit,
    offset,
    order,
    include: [{ association: "customer" }, { association: "agent" }],
    attributes: {
      include:
        currentUser?.id && currentUser?.role !== "ADMIN"
          ? [[unreadCountLiteral(currentUser.id), "unreadMessageCount"]]
          : [],
    },
    distinct: true,
  });

export const createTicket = (data, options = {}) => Ticket.create(data, options);

export const updateTicket = async (ticket, data) => ticket.update(data);

export const createTicketMessage = (data) => TicketMessage.create(data);

export const markTicketReadRepo = async (ticketId, userId) => {
  return TicketMessage.update(
    { seen: true },
    {
      where: {
        ticketId,
        seen: false,
        senderId: { [Op.ne]: userId },
      },
    }
  );
};