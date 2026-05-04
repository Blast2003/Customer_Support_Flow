import { Op } from "sequelize";
import { SLARecord, Ticket, EscalationRequest, User } from "../models/index.js";
import * as notifService from "./notification.service.js";
import { emitToUsers } from "../sockets/socket.js";
import { getPagination } from "../utils/pagination.js";

const WARNING_MINUTES = 15;
const ACTIVE_SLA_STATUSES = ["ON_TRACK", "AT_RISK", "BREACHED"];

// AT_RISK = First reply delay -> Customer experience

// BREACHED = The issue is still not solved after deadline

const PRIORITY_MAP = {
  LOW: { responseHours: 4, resolutionHours: 72 },
  MEDIUM: { responseHours: 2, resolutionHours: 24 },
  HIGH: { responseHours: 1, resolutionHours: 12 },
  URGENT: { responseHours: 0.5, resolutionHours: 4 },
};

const PRIORITY_ORDER = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const addMinutes = (date, minutes) => new Date(date.getTime() + minutes * 60 * 1000);

const getPriorityIndex = (priority = "MEDIUM") => {
  const index = PRIORITY_ORDER.indexOf(String(priority).toUpperCase());
  return index >= 0 ? index : 1;
};

const upgradePriority = (priority = "MEDIUM") => {
  const currentIndex = getPriorityIndex(priority);
  return PRIORITY_ORDER[Math.min(currentIndex + 1, PRIORITY_ORDER.length - 1)];
};

export const getSlaDates = (priority) => {
  const now = Date.now();
  const selected = PRIORITY_MAP[String(priority || "MEDIUM").toUpperCase()] || PRIORITY_MAP.MEDIUM;

  return {
    responseDueAt: new Date(now + selected.responseHours * 60 * 60 * 1000),
    resolutionDueAt: new Date(now + selected.resolutionHours * 60 * 60 * 1000),
  };
};

const isResolvedTicket = (ticket) => {
  return ["RESOLVED", "CLOSED"].includes(ticket?.status);
};

const getCurrentDueAt = (ticket, record) => {
  if (!record) return null;

  // Before the first response, we monitor responseDueAt.
  // After the first response, we monitor resolutionDueAt.
  if (!record.firstResponseAt) return record.responseDueAt;
  return record.resolutionDueAt;
};

const computeSlaStatus = (ticket, record) => {
  if (!ticket || !record) return "ON_TRACK";
  if (isResolvedTicket(ticket)) return "RESOLVED";

  const dueAt = getCurrentDueAt(ticket, record);
  if (!dueAt) return "ON_TRACK";

  const now = new Date();
  const due = new Date(dueAt);
  const warnAt = addMinutes(due, -WARNING_MINUTES);

  if (now > due) return "BREACHED";
  if (now >= warnAt) return "AT_RISK";

  return "ON_TRACK";
};

const getAdminIds = async () => {
  const admins = await User.findAll({
    where: { role: "ADMIN" },
    attributes: ["id"],
  });

  return admins.map((admin) => admin.id);
};

const autoEscalateBreach = async (ticket, record) => {
  if (record.escalatedAt) return null;

  const updatedTicket = await ticket.update({
    priority: upgradePriority(ticket.priority),
    status: "ESCALATED",
  });

  // Adjust field names here if your EscalationRequest model differs.
  const escalation = await EscalationRequest.create({
    ticketId: ticket.id,
    createdBy: ticket.agentId || ticket.customerId,
    targetUserId: ticket.agentId || null,
    status: "OPEN",
    reason: "Auto escalation due to SLA breach",
  });

  await record.update({
    escalatedAt: new Date(),
  });

  return { updatedTicket, escalation };
};

export const markFirstResponseForTicket = async (ticketId) => {
  const ticket = await Ticket.findByPk(ticketId, {
    include: [{ association: "slaRecord" }],
  });

  if (!ticket?.slaRecord) return null;

  if (!ticket.slaRecord.firstResponseAt) {
    await ticket.slaRecord.update({
      firstResponseAt: new Date(),
    });
  }

  return refreshSlaForTicket(ticketId, { source: "first_response" });
};

export const refreshSlaForTicket = async (ticketId, options = {}) => {
  const ticket = await Ticket.findByPk(ticketId, {
    include: [
      { association: "customer" },
      { association: "agent" },
      { association: "slaRecord" },
    ],
  });

  if (!ticket) return null;
  if (!ticket.slaRecord) return null;

  const record = ticket.slaRecord;
  const nextStatus = computeSlaStatus(ticket, record);

  const updates = {};
  if (record.status !== nextStatus) {
    updates.status = nextStatus;
  }

  if (nextStatus === "BREACHED" && !record.breachedAt) {
    updates.breachedAt = new Date();
  }

  if (Object.keys(updates).length > 0) {
    await record.update(updates);
  }

  if (nextStatus === "AT_RISK" && !record.atRiskNotifiedAt) {
    const agentId = ticket.agentId;

    if (agentId) {
      await notifService.notifyUsers([agentId], {
        title: "SLA warning",
        body: `Ticket ${ticket.ticketNumber} is close to SLA limit.`,
        type: "SLA",
        meta: {
          ticketId: ticket.id,
          slaRecordId: record.id,
          status: "AT_RISK",
        },
      });
    }

    await record.update({
      atRiskNotifiedAt: new Date(),
    });
  }

  if (nextStatus === "BREACHED") {
    const adminIds = await getAdminIds();
    const notifyTargets = [...new Set([ticket.agentId, ...adminIds].filter(Boolean))];

    if (!record.breachedNotifiedAt) {
      await notifService.notifyUsers(notifyTargets, {
        title: "SLA breached",
        body: `Ticket ${ticket.ticketNumber} has breached SLA.`,
        type: "SLA",
        meta: {
          ticketId: ticket.id,
          slaRecordId: record.id,
          status: "BREACHED",
        },
      });

      await record.update({
        breachedNotifiedAt: new Date(),
      });
    }

    if (!record.escalatedAt) {
      await autoEscalateBreach(ticket, record);
    }
  }

  const reloadedTicket = await Ticket.findByPk(ticketId, {
    include: [
      { association: "customer" },
      { association: "agent" },
      { association: "slaRecord" },
    ],
  });

  const recipientIds = [...new Set([reloadedTicket.customerId, reloadedTicket.agentId].filter(Boolean))];

  emitToUsers(recipientIds, "sla:updated", {
    ticketId: reloadedTicket.id,
    ticket: reloadedTicket,
    slaRecord: reloadedTicket.slaRecord,
    status: reloadedTicket.slaRecord?.status,
    source: options.source || "refresh",
  });

  return reloadedTicket.slaRecord;
};

export const refreshAllSlaStatuses = async () => {
  const records = await SLARecord.findAll({
    where: {
      status: {
        [Op.in]: ACTIVE_SLA_STATUSES,
      },
    },
    include: [{ association: "ticket" }],
  });

  for (const record of records) {
    if (record.ticket) {
      await refreshSlaForTicket(record.ticketId, { source: "scheduler" });
    }
  }
};

const buildTicketWhereByUser = (currentUser) => {
  const where = {};

  if (currentUser.role === "AGENT") {
    where.agentId = currentUser.id;
  }

  if (currentUser.role === "CUSTOMER") {
    where.customerId = currentUser.id;
  }

  return where;
};

export const syncSlaStatusesForUser = async (currentUser) => {
  const ticketWhere = buildTicketWhereByUser(currentUser);

  const records = await SLARecord.findAll({
    where: {
      status: {
        [Op.in]: ACTIVE_SLA_STATUSES,
      },
    },
    include: [
      {
        association: "ticket",
        required: true,
        where: ticketWhere,
      },
    ],
  });

  for (const record of records) {
    await refreshSlaForTicket(record.ticketId, { source: "sync" });
  }
};

export const listSLA = async (query, currentUser) => {
  const { limit, offset } = getPagination(query);
  const where = {};

  if (query.status) {
    where.status = query.status;
  }

  await syncSlaStatusesForUser(currentUser);

  const include = [{ association: "ticket" }];

  if (currentUser.role === "AGENT") {
    include[0].where = { agentId: currentUser.id };
    include[0].required = true;
  }

  if (currentUser.role === "CUSTOMER") {
    include[0].where = { customerId: currentUser.id };
    include[0].required = true;
  }

  return SLARecord.findAndCountAll({
    where,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
    include,
  });
};

export const getSlaSummary = async (currentUser) => {
  await syncSlaStatusesForUser(currentUser);

  const ticketWhere = {};

  if (currentUser.role === "AGENT") {
    ticketWhere.agentId = currentUser.id;
  }

  if (currentUser.role === "CUSTOMER") {
    ticketWhere.customerId = currentUser.id;
  }

  const [onTrack, atRisk, breached, resolved] = await Promise.all([
    SLARecord.count({
      where: { status: "ON_TRACK" },
      include: [{ association: "ticket", where: ticketWhere, required: true }],
    }),
    SLARecord.count({
      where: { status: "AT_RISK" },
      include: [{ association: "ticket", where: ticketWhere, required: true }],
    }),
    SLARecord.count({
      where: { status: "BREACHED" },
      include: [{ association: "ticket", where: ticketWhere, required: true }],
    }),
    SLARecord.count({
      where: { status: "RESOLVED" },
      include: [{ association: "ticket", where: ticketWhere, required: true }],
    }),
  ]);

  return { onTrack, atRisk, breached, resolved };
};