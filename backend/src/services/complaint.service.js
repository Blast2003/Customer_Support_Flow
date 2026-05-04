import { Op } from "sequelize";
import { Ticket, Complaint } from "../models/index.js";
import { getPagination } from "../utils/pagination.js";
import { notifyAdmins, notifyUsers } from "./notification.service.js";
import { emitToUsers } from "../sockets/socket.js";

const forbiddenError = (message = "Forbidden") => {
  const err = new Error(message);
  err.status = 403;
  return err;
};

const notFoundError = (message = "Not found") => {
  const err = new Error(message);
  err.status = 404;
  return err;
};

export const createComplaint = async (data, currentUser) => {
  if (currentUser.role !== "CUSTOMER") {
    throw forbiddenError("Only customers can create complaints");
  }

  const ticket = await Ticket.findByPk(data.ticketId, {
    include: [{ association: "agent" }, { association: "customer" }],
  });

  if (!ticket) {
    throw notFoundError("Ticket not found");
  }

  if (String(ticket.customerId) !== String(currentUser.id)) {
    throw forbiddenError("You can only complain about your own ticket");
  }

  const complaint = await Complaint.create({
    ticketId: ticket.id,
    customerId: ticket.customerId,
    createdBy: currentUser.id,
    category: data.category,
    description: data.description || null,
    severity: data.severity || "MEDIUM",
    status: "OPEN",
    resolutionNote: null,
  });

  await notifyAdmins({
    title: "Complaint created",
    body: `Complaint created for ticket ${ticket.ticketNumber}.`,
    type: "COMPLAINT",
    meta: { complaintId: complaint.id, ticketId: ticket.id },
  });

  if (ticket.agentId) {
    await notifyUsers([ticket.agentId], {
      title: "New complaint assigned to your ticket",
      body: `A complaint was created for ticket ${ticket.ticketNumber}.`,
      type: "COMPLAINT",
      meta: { complaintId: complaint.id, ticketId: ticket.id },
    });
  }

  emitToUsers([ticket.agentId].filter(Boolean), "complaint:created", {
    complaint,
    ticketId: ticket.id,
  });

  return complaint;
};

export const listComplaints = async (query, currentUser) => {
  const { limit, offset } = getPagination(query);

  const where = {};

  if (query.status) {
    where.status = query.status;
  }

  if (query.ticketId) {
    where.ticketId = query.ticketId;
  }

  const include = [
    {
      association: "ticket",
      include: [{ association: "customer" }, { association: "agent" }],
    },
    { association: "customer" },
    { association: "creator" },
  ];

  if (currentUser.role === "CUSTOMER") {
    where.customerId = currentUser.id;
  } else if (currentUser.role === "AGENT") {
    include[0] = {
      association: "ticket",
      where: {
        agentId: currentUser.id,
      },
      required: true,
      include: [{ association: "customer" }, { association: "agent" }],
    };
  } else if (currentUser.role !== "ADMIN") {
    throw forbiddenError("Forbidden");
  }

  return Complaint.findAndCountAll({
    where,
    include,
    order: [["createdAt", "DESC"]],
    limit,
    offset,
    distinct: true,
  });
};

export const updateComplaint = async (id, data, currentUser) => {
  if (currentUser.role !== "ADMIN") {
    throw forbiddenError("Only admins can update complaints");
  }

  const complaint = await Complaint.findByPk(id, {
    include: [{ association: "ticket" }],
  });

  if (!complaint) {
    throw notFoundError("Complaint not found");
  }

  const updateData = {};

  if (data.status !== undefined) updateData.status = data.status;
  if (data.severity !== undefined) updateData.severity = data.severity;
  if (data.resolutionNote !== undefined) updateData.resolutionNote = data.resolutionNote;

  if (updateData.status === "RESOLVED" && !updateData.resolutionNote && !complaint.resolutionNote) {
    throw Object.assign(new Error("Resolution note is required when resolving a complaint"), {
      status: 400,
    });
  }

  await complaint.update(updateData);

  const ticket = complaint.ticket;

  if (ticket?.customerId) {
    await notifyUsers([ticket.customerId], {
      title: "Complaint updated",
      body: `Your complaint for ticket ${ticket.ticketNumber} was updated.`,
      type: "COMPLAINT",
      meta: { ticketId: ticket.id, complaintId: complaint.id },
    });
  }

  if (ticket?.agentId) {
    await notifyUsers([ticket.agentId], {
      title: "Complaint updated",
      body: `A complaint for ticket ${ticket.ticketNumber} was updated.`,
      type: "COMPLAINT",
      meta: { ticketId: ticket.id, complaintId: complaint.id },
    });
  }

  emitToUsers([ticket?.customerId, ticket?.agentId].filter(Boolean), "complaint:updated", {
    complaint,
    ticketId: ticket?.id || null,
  });

  return complaint.reload();
};