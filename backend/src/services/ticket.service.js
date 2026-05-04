import { Op } from "sequelize";
import { sequelize } from "../config/db.js";
import { Ticket, SLARecord, TicketMessage, EscalationRequest } from "../models/index.js";
import * as ticketRepo from "../repositories/ticket.repository.js";
import { generateTicketNumber } from "../utils/generateTicketNumber.js";
import { uploadBase64ToCloudinary } from "./upload.service.js";
import * as slaService from "./sla.service.js";
import { createEscalationRequest } from "./escalationRequest.service.js";
import { notifyAdmins, notifyUsers } from "./notification.service.js";
import { emitToUsers } from "../sockets/socket.js";

export const getAgentMetrics = async (currentUser) => {
  const agentId = currentUser.id;

  const [assignedTickets, waitingReply, resolvedToday, escalations, recentTickets] =
    await Promise.all([
      Ticket.count({
        where: { agentId },
      }),

      Ticket.count({
        where: {
          agentId,
          status: "WAITING",
        },
      }),

      Ticket.count({
        where: {
          agentId,
          status: "RESOLVED",
          updatedAt: {
            [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),

      EscalationRequest.count({
        where: {
          [Op.or]: [{ createdBy: agentId }, { handledBy: agentId }],
        },
      }),

      Ticket.findAll({
        where: { agentId },
        order: [["updatedAt", "DESC"]],
        limit: 5,
        include: [
          { association: "customer", attributes: ["id", "name", "email"] },
          { association: "agent", attributes: ["id", "name", "email"] },
          { association: "slaRecord" },
        ],
      }),
    ]);

  return {
    assignedTickets,
    waitingReply,
    resolvedToday,
    escalations,
    recentTickets,
  };
};

export const createTicket = async (payload, currentUser) => {
  return sequelize.transaction(async () => {
    const customerId =
      currentUser.role === "CUSTOMER"
        ? currentUser.id
        : payload.customerId || null;

    if (!customerId) {
      throw Object.assign(new Error("customerId is required"), { status: 400 });
    }

    const attachment = payload.attachmentFile
      ? await uploadBase64ToCloudinary(payload.attachmentFile, "tickets")
      : null;

    const priority = payload.priority || "MEDIUM";
    const { responseDueAt, resolutionDueAt } = slaService.getSlaDates(priority);

    const ticket = await ticketRepo.createTicket({
      ticketNumber: generateTicketNumber(),
      subject: payload.subject,
      description: payload.description,
      status: "OPEN",
      priority,
      customerId,
      agentId: payload.agentId || null,
      attachmentUrl: attachment?.url || null,
      dueAt: resolutionDueAt,
    });

    await SLARecord.create({
      ticketId: ticket.id,
      responseDueAt,
      resolutionDueAt,
      breachedAt: null,
      status: "ON_TRACK",
    });

    await notifyAdmins({
      title: "New ticket created",
      body: `Ticket ${ticket.ticketNumber} was created.`,
      type: "TICKET",
      meta: { ticketId: ticket.id },
    });

    if (ticket.agentId) {
      await notifyUsers([ticket.agentId], {
        title: "Ticket assigned",
        body: `Ticket ${ticket.ticketNumber} was assigned to you.`,
        type: "TICKET",
        meta: { ticketId: ticket.id },
      });
    }

    await notifyUsers([ticket.customerId], {
      title: "Ticket received",
      body: `Your ticket ${ticket.ticketNumber} has been created.`,
      type: "TICKET",
      meta: { ticketId: ticket.id },
    });

    const hydrated = await ticketRepo.findTicketById(ticket.id);

    emitToUsers([hydrated.customerId, hydrated.agentId], "ticket:created", {
      ticket: hydrated,
    });

    return hydrated;
  });
};

export const getTicket = async (id, currentUser) => {
  const ticket = await ticketRepo.findTicketById(id);

  if (!ticket) {
    throw Object.assign(new Error("Ticket not found"), { status: 404 });
  }

  if (currentUser.role === "CUSTOMER") {
    if (ticket.customerId !== currentUser.id) {
      throw Object.assign(new Error("Forbidden"), { status: 403 });
    }
  }

  if (currentUser.role === "AGENT") {
    if (ticket.agentId && ticket.agentId !== currentUser.id) {
      throw Object.assign(new Error("Forbidden"), { status: 403 });
    }
  }

  return ticket;
};

export const listTickets = async (query, currentUser) => {
  const limit = Math.min(Math.max(Number(query.limit || 10), 1), 100);
  const page = Math.max(Number(query.page || 1), 1);
  const offset = (page - 1) * limit;

  const where = {};

  if (query.status) where.status = query.status;

  if (query.q) {
    where[Op.or] = [
      { subject: { [Op.like]: `%${query.q}%` } },
      { ticketNumber: { [Op.like]: `%${query.q}%` } },
    ];
  }

  if (currentUser.role === "CUSTOMER") {
    where.customerId = currentUser.id;
  }

  if (currentUser.role === "AGENT") {
    if (query.scope === "assigned") {
      where.agentId = currentUser.id;
    } else if (query.scope === "queue") {
      where.agentId = null;
    }
  }

  return ticketRepo.findTickets({
    where,
    limit,
    offset,
    currentUser,
  });
};

export const markTicketRead = async (ticketId, currentUser) => {
  const ticket = await ticketRepo.findTicketById(ticketId);
  if (!ticket) {
    throw Object.assign(new Error("Ticket not found"), { status: 404 });
  }

  if (currentUser.role === "CUSTOMER" && ticket.customerId !== currentUser.id) {
    throw Object.assign(new Error("Forbidden"), { status: 403 });
  }

  if (currentUser.role === "AGENT") {
    if (ticket.agentId && ticket.agentId !== currentUser.id) {
      throw Object.assign(new Error("Forbidden"), { status: 403 });
    }
  }

  await ticketRepo.markTicketReadRepo(ticket.id, currentUser.id);
  return true;
};

export const updateTicket = async (id, data, currentUser) => {
  const ticket = await ticketRepo.findTicketById(id);
  if (!ticket) {
    throw Object.assign(new Error("Ticket not found"), { status: 404 });
  }

  if (currentUser.role === "CUSTOMER") {
    throw Object.assign(new Error("Forbidden"), { status: 403 });
  }

  const oldAgentId = ticket.agentId;
  const oldStatus = ticket.status;

  const allowedUpdate = {};
  if (data.status) allowedUpdate.status = data.status;
  if (data.priority) allowedUpdate.priority = data.priority;

  if (data.agentId !== undefined) {
    if (currentUser.role === "ADMIN") {
      allowedUpdate.agentId = data.agentId;
    } else if (currentUser.role === "AGENT") {
      if (!ticket.agentId || ticket.agentId === currentUser.id) {
        allowedUpdate.agentId = currentUser.id;
      } else {
        throw Object.assign(new Error("Forbidden"), { status: 403 });
      }
    }
  }

  await ticketRepo.updateTicket(ticket, allowedUpdate);
  await slaService.refreshSlaForTicket(ticket.id);

  const updated = await ticketRepo.findTicketById(id);

  if (data.agentId !== undefined && data.agentId !== oldAgentId) {
    if (oldAgentId) {
      await notifyUsers([oldAgentId], {
        title: "Ticket reassigned",
        body: `Ticket ${updated.ticketNumber} was reassigned to another agent.`,
        type: "TICKET",
        meta: { ticketId: updated.id },
      });
    }

    if (updated.agentId) {
      await notifyUsers([updated.agentId], {
        title: "Ticket assigned",
        body: `Ticket ${updated.ticketNumber} was assigned to you.`,
        type: "TICKET",
        meta: { ticketId: updated.id },
      });
    }

    if (updated.customerId) {
      await notifyUsers([updated.customerId], {
        title: "Ticket reassigned",
        body: `Your ticket ${updated.ticketNumber} was moved to another agent.`,
        type: "TICKET",
        meta: { ticketId: updated.id },
      });
    }

    await notifyAdmins({
      title: "Ticket reassigned",
      body: `Ticket ${updated.ticketNumber} was reassigned.`,
      type: "TICKET",
      meta: { ticketId: updated.id },
    });
  }

  if (data.status && data.status !== oldStatus) {
    await notifyAdmins({
      title: "Ticket status updated",
      body: `Ticket ${updated.ticketNumber} status changed to ${data.status}.`,
      type: "TICKET",
      meta: { ticketId: updated.id },
    });

    if (updated.customerId) {
      await notifyUsers([updated.customerId], {
        title: "Ticket status updated",
        body: `Your ticket ${updated.ticketNumber} changed to ${data.status}.`,
        type: "TICKET",
        meta: { ticketId: updated.id },
      });
    }
  }

  emitToUsers([updated.customerId, updated.agentId], "ticket:updated", {
    ticket: updated,
  });

  return updated;
};

export const addMessage = async (
  { ticketId, message, attachmentFile },
  currentUser
) => {
  const ticket = await ticketRepo.findTicketById(ticketId);
  if (!ticket) {
    throw Object.assign(new Error("Ticket not found"), { status: 404 });
  }

  const attachment = attachmentFile
    ? await uploadBase64ToCloudinary(attachmentFile, "ticket-messages")
    : null;

  const created = await ticketRepo.createTicketMessage({
    ticketId,
    senderId: currentUser.id,
    message,
    attachmentUrl: attachment?.url || null,
    seen: false,
  });

  const nextStatus =
    ticket.status === "ESCALATED"
      ? "ESCALATED"
      : currentUser.role === "CUSTOMER"
        ? "WAITING"
        : "IN_PROGRESS";

  await Ticket.update({ status: nextStatus }, { where: { id: ticketId } });

  if (["AGENT", "ADMIN"].includes(currentUser.role)) {
    await slaService.markFirstResponseForTicket(ticketId);
  } else {
    await slaService.refreshSlaForTicket(ticketId);
  }

  const recipientId =
    currentUser.id === ticket.customerId ? ticket.agentId : ticket.customerId;

  if (recipientId) {
    await notifyUsers([recipientId], {
      title: "New message",
      body: `New message in ticket ${ticket.ticketNumber}.`,
      type: "MESSAGE",
      meta: { ticketId: ticket.id, messageId: created.id },
    });
  }

  const hydrated = await ticketRepo.findTicketById(ticketId);

  emitToUsers([ticket.customerId, ticket.agentId], "ticket:messageCreated", {
    ticketId,
    message: created,
    ticket: hydrated,
  });

  return created;
};

export const resolveTicket = async (id, currentUser) => {
  const ticket = await ticketRepo.findTicketById(id);
  if (!ticket) {
    throw Object.assign(new Error("Ticket not found"), { status: 404 });
  }

  if (currentUser.role === "CUSTOMER") {
    throw Object.assign(new Error("Forbidden"), { status: 403 });
  }

  if (currentUser.role === "AGENT" && ticket.agentId !== currentUser.id) {
    throw Object.assign(new Error("Forbidden"), { status: 403 });
  }

  await ticket.update({ status: "RESOLVED" });
  await slaService.refreshSlaForTicket(ticket.id);

  const updated = await ticketRepo.findTicketById(id);

  await notifyAdmins({
    title: "Ticket resolved",
    body: `Ticket ${updated.ticketNumber} was resolved.`,
    type: "TICKET",
    meta: { ticketId: updated.id },
  });

  if (updated.customerId) {
    await notifyUsers([updated.customerId], {
      title: "Ticket resolved",
      body: `Your ticket ${updated.ticketNumber} was resolved.`,
      type: "TICKET",
      meta: { ticketId: updated.id },
    });
  }

  emitToUsers([updated.customerId, updated.agentId], "ticket:updated", {
    ticket: updated,
  });

  return updated;
};

export const escalateTicket = async (id, currentUser, reason = "") => {
  const ticket = await ticketRepo.findTicketById(id);
  if (!ticket) {
    throw Object.assign(new Error("Ticket not found"), { status: 404 });
  }

  if (currentUser.role === "CUSTOMER") {
    throw Object.assign(new Error("Forbidden"), { status: 403 });
  }

  if (currentUser.role === "AGENT" && ticket.agentId !== currentUser.id) {
    throw Object.assign(new Error("Forbidden"), { status: 403 });
  }

  const escalation = await createEscalationRequest(
    {
      ticketId: ticket.id,
      reason: reason || `Escalation requested for ticket ${ticket.ticketNumber}.`,
      direction: "AGENT_TO_ADMIN",
      targetRole: "ADMIN",
      updateTicketStatus: true,
      ticketStatus: "ESCALATED",
      metadata: { source: "AGENT_MANUAL_ESCALATION" },
    },
    currentUser
  );

  await ticket.update({ status: "ESCALATED" });

  const updated = await ticketRepo.findTicketById(id);

  emitToUsers([updated.customerId, updated.agentId], "ticket:updated", {
    ticket: updated,
  });

  return {
    ticket: updated,
    escalation,
  };
};

export const getTicketMessages = async (ticketId, query, currentUser) => {
  await getTicket(ticketId, currentUser);

  const limit = Number(query.limit || 20);
  const page = Number(query.page || 1);

  return ticketRepo.findTicketMessages({
    ticketId,
    limit,
    offset: (page - 1) * limit,
  });
};

export const getTicketComplaints = async (ticketId, query, currentUser) => {
  await getTicket(ticketId, currentUser);

  const limit = Number(query.limit || 10);
  const page = Number(query.page || 1);

  return ticketRepo.findTicketComplaints({
    ticketId,
    limit,
    offset: (page - 1) * limit,
  });
};

export const getTicketEscalations = async (ticketId, query, currentUser) => {
  await getTicket(ticketId, currentUser);

  const limit = Number(query.limit || 10);
  const page = Number(query.page || 1);

  return ticketRepo.findTicketEscalations({
    ticketId,
    limit,
    offset: (page - 1) * limit,
  });
};