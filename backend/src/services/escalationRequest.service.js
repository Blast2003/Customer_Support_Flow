import { Op } from "sequelize";
import { sequelize } from "../config/db.js";
import { Ticket, EscalationRequest, User } from "../models/index.js";
import { notifyAdmins, notifyUsers } from "./notification.service.js";
import { emitToUsers } from "../sockets/socket.js";

const ESCALATION_FINAL_STATUSES = ["REJECTED", "RESOLVED"];
const ACTIVE_ESCALATION_STATUSES = ["OPEN", "UNDER_REVIEW"];

const escalationInclude = [
  { association: "creator" },
  { association: "handler" },
  { association: "targetUser" },
  {
    association: "ticket",
    include: [
      { association: "customer" },
      { association: "agent" },
      { association: "slaRecord" },
    ],
  },
];

const ticketInclude = [
  { association: "customer" },
  { association: "agent" },
  { association: "slaRecord" },
];

const normalizeIds = (ids = []) =>
  [...new Set((ids || []).filter(Boolean).map(String))];

const loadEscalationById = (id) =>
  EscalationRequest.findByPk(id, {
    include: escalationInclude,
  });

const buildTicketSnapshot = (ticket) => ({
  originalAgentId: ticket.agentId || null,
  originalTicketStatus: ticket.status || null,
  originalPriority: ticket.priority || null,
});

const getEscalationTargetSummary = (currentUserRole, targetRole, targetUserId) => {
  if (currentUserRole === "AGENT") {
    return {
      targetRole: "ADMIN",
      direction: "AGENT_TO_ADMIN",
      targetUserId: targetUserId || null,
    };
  }

  return {
    targetRole: targetRole === "AGENT" ? "AGENT" : "ADMIN",
    direction: targetRole === "AGENT" ? "ADMIN_TO_AGENT" : "AGENT_TO_ADMIN",
    targetUserId: targetUserId || null,
  };
};

export const createEscalationRequest = async (payload, currentUser) => {
  if (!payload?.ticketId) {
    throw Object.assign(new Error("ticketId is required"), { status: 400 });
  }

  if (!payload?.reason?.trim()) {
    throw Object.assign(new Error("Reason is required"), { status: 400 });
  }

  const ticket = await Ticket.findByPk(payload.ticketId, {
    include: ticketInclude,
  });

  if (!ticket) {
    throw Object.assign(new Error("Ticket not found"), { status: 404 });
  }

  if (currentUser.role === "CUSTOMER") {
    throw Object.assign(new Error("Forbidden"), { status: 403 });
  }

  if (currentUser.role === "AGENT" && ticket.agentId !== currentUser.id) {
    throw Object.assign(new Error("Forbidden"), { status: 403 });
  }

  const existingActive = await EscalationRequest.findOne({
    where: {
      ticketId: ticket.id,
      status: {
        [Op.in]: ACTIVE_ESCALATION_STATUSES,
      },
    },
  });

  if (existingActive) {
    throw Object.assign(new Error("This ticket already has an active escalation"), {
      status: 409,
    });
  }

  const snapshot = buildTicketSnapshot(ticket);

  const created = await sequelize.transaction(async (transaction) => {
    const targetSummary = getEscalationTargetSummary(
      currentUser.role,
      payload.targetRole,
      payload.targetUserId
    );

    let targetUser = null;

    if (currentUser.role === "AGENT") {
      if (payload.targetUserId) {
        targetUser = await User.findByPk(payload.targetUserId, {
          transaction,
        });

        if (!targetUser || targetUser.role !== "ADMIN") {
          throw Object.assign(
            new Error("targetUserId must point to an admin for agent escalations"),
            { status: 400 }
          );
        }
      }
    } else if (currentUser.role === "ADMIN") {
      if (targetSummary.targetRole !== "AGENT") {
        throw Object.assign(
          new Error("Admin escalation must target an agent"),
          { status: 400 }
        );
      }

      if (!targetSummary.targetUserId) {
        throw Object.assign(
          new Error("targetUserId is required when admin escalates to an agent"),
          { status: 400 }
        );
      }

      targetUser = await User.findByPk(targetSummary.targetUserId, {
        transaction,
      });

      if (!targetUser || targetUser.role !== "AGENT") {
        throw Object.assign(
          new Error("targetUserId must point to an agent"),
          { status: 400 }
        );
      }
    }

    const defaultTicketStatus =
      payload.ticketStatus ||
      (currentUser.role === "AGENT" ? "WAITING" : "IN_PROGRESS");

    const record = await EscalationRequest.create(
      {
        ticketId: ticket.id,
        createdBy: currentUser.id,
        handledBy: null,
        targetUserId: targetSummary.targetUserId,
        targetRole: targetSummary.targetRole,
        direction: targetSummary.direction,
        reason: payload.reason.trim(),
        status: "OPEN",
        ticketStatus: defaultTicketStatus,
        resolutionNote: null,
        updateTicketStatus: payload.updateTicketStatus !== false,
        metadata: {
          ...(payload.metadata || {}),
          ...snapshot,
          createdByRole: currentUser.role,
        },
      },
      { transaction }
    );

    if (record.updateTicketStatus && defaultTicketStatus) {
      await ticket.update(
        { status: defaultTicketStatus },
        { transaction }
      );
    }

    return record;
  });

  const hydrated = await loadEscalationById(created.id);

  const notificationPayload = {
    title: "Escalation request created",
    body: `Ticket ${ticket.ticketNumber} was escalated.`,
    type: "ESCALATION",
    meta: { escalationRequestId: created.id, ticketId: ticket.id },
  };

  await notifyAdmins(notificationPayload, {
    excludeUserIds: [currentUser.id],
  });

  await notifyUsers([currentUser.id], notificationPayload);

  if (created.targetUserId && String(created.targetUserId) !== String(currentUser.id)) {
    await notifyUsers([created.targetUserId], notificationPayload);
  }

  emitToUsers(
    normalizeIds([ticket.customerId, ticket.agentId, created.targetUserId]),
    "escalation:created",
    {
      escalation: hydrated,
      ticketId: ticket.id,
    }
  );

  emitToUsers(
    normalizeIds([ticket.customerId, ticket.agentId, created.targetUserId]),
    "ticket:updated",
    {
      ticket: await Ticket.findByPk(ticket.id, { include: ticketInclude }),
      reason: "ESCALATION_CREATED",
    }
  );

  return hydrated;
};

export const listEscalations = async (query, currentUser) => {
  const where = {};

  if (currentUser.role === "CUSTOMER") {
    throw Object.assign(new Error("Forbidden"), { status: 403 });
  }

  if (currentUser.role === "AGENT") {
    where[Op.or] = [
      { createdBy: currentUser.id },
      { targetUserId: currentUser.id },
    ];
  }

  if (query.status) {
    where.status = query.status;
  }

  return EscalationRequest.findAndCountAll({
    where,
    include: escalationInclude,
    order: [["createdAt", "DESC"]],
    limit: Number(query.limit || 10),
    offset: (Number(query.page || 1) - 1) * Number(query.limit || 10),
    distinct: true,
  });
};

export const updateEscalation = async (id, data, currentUser) => {
  if (currentUser.role !== "ADMIN") {
    throw Object.assign(new Error("Forbidden"), { status: 403 });
  }

  const escalation = await EscalationRequest.findByPk(id, {
    include: escalationInclude,
  });

  if (!escalation) {
    throw Object.assign(new Error("Escalation not found"), { status: 404 });
  }

  if (ESCALATION_FINAL_STATUSES.includes(escalation.status)) {
    throw Object.assign(new Error("Escalation is already finalized"), {
      status: 409,
    });
  }

  const action = (data?.action || "").toUpperCase();

  if (!["REASSIGN", "REJECT", "HANDLE_DIRECTLY", "UPDATE"].includes(action)) {
    throw Object.assign(new Error("Invalid escalation action"), {
      status: 400,
    });
  }

  const updated = await sequelize.transaction(async (transaction) => {
    const freshTicket = await Ticket.findByPk(escalation.ticketId, {
      include: ticketInclude,
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!freshTicket) {
      throw Object.assign(new Error("Ticket not found"), { status: 404 });
    }

    const meta = escalation.metadata || {};
    const updates = {
      handledBy: currentUser.id,
    };

    const notifyIds = [];
    const notifyCustomer = data.notifyCustomer !== false;

    if (action === "REJECT") {
      updates.status = "REJECTED";

      if (data.resolutionNote !== undefined) {
        updates.resolutionNote = data.resolutionNote;
      }

      if (meta.originalAgentId) {
        await freshTicket.update(
          {
            agentId: meta.originalAgentId,
            status: meta.originalTicketStatus || freshTicket.status,
          },
          { transaction }
        );
      } else if (meta.originalTicketStatus) {
        await freshTicket.update(
          { status: meta.originalTicketStatus },
          { transaction }
        );
      }

      notifyIds.push(
        escalation.createdBy,
        freshTicket.agentId,
        freshTicket.customerId,
        currentUser.id
      );
    }

    if (action === "REASSIGN") {
      if (!data.targetUserId) {
        throw Object.assign(new Error("targetUserId is required for reassignment"), {
          status: 400,
        });
      }

      const targetAgent = await User.findByPk(data.targetUserId, {
        transaction,
      });

      if (!targetAgent || targetAgent.role !== "AGENT") {
        throw Object.assign(new Error("targetUserId must point to an agent"), {
          status: 400,
        });
      }

      if (freshTicket.agentId && String(targetAgent.id) === String(freshTicket.agentId)) {
        throw Object.assign(
          new Error("This ticket is already assigned to this agent"),
          { status: 409 }
        );
      }

      updates.status = "APPROVED";
      updates.targetRole = "AGENT";
      updates.targetUserId = targetAgent.id;

      if (data.resolutionNote !== undefined) {
        updates.resolutionNote = data.resolutionNote;
      }

      await freshTicket.update(
        {
          agentId: targetAgent.id,
          status: data.ticketStatus || "IN_PROGRESS",
        },
        { transaction }
      );

      notifyIds.push(
        escalation.createdBy,
        targetAgent.id,
        freshTicket.customerId,
        escalation.targetUserId,
        currentUser.id
      );
    }
    if (action === "HANDLE_DIRECTLY") {
      updates.status = data.status || "APPROVED";
      updates.targetRole = "ADMIN";
      updates.targetUserId = currentUser.id;

      if (data.resolutionNote !== undefined) {
        updates.resolutionNote = data.resolutionNote;
      }

      await freshTicket.update(
        {
          agentId: currentUser.id,
          status: data.ticketStatus || "IN_PROGRESS",
        },
        { transaction }
      );

      notifyIds.push(
        escalation.createdBy,
        currentUser.id,
        freshTicket.customerId,
        freshTicket.agentId
      );
    }

    if (action === "UPDATE") {
      if (data.status) updates.status = data.status;
      if (data.handledBy !== undefined) updates.handledBy = data.handledBy;
      if (data.resolutionNote !== undefined) updates.resolutionNote = data.resolutionNote;
      if (data.ticketStatus) updates.ticketStatus = data.ticketStatus;
    }

    await escalation.update(updates, { transaction });

    return {
      escalationId: escalation.id,
      ticketId: freshTicket.id,
      ticket: freshTicket,
      notifyIds: normalizeIds(
        notifyCustomer
          ? notifyIds
          : notifyIds.filter((id) => id !== freshTicket.customerId)
      ),
    };
  });

  const hydrated = await loadEscalationById(id);

  const ticketAfterUpdate = await Ticket.findByPk(updated.ticketId, {
    include: ticketInclude,
  });

  const finalNotifyIds = normalizeIds([
    updated.notifyIds,
    hydrated?.handledBy,
    hydrated?.targetUserId,
    hydrated?.createdBy,
    ticketAfterUpdate?.customerId,
    ticketAfterUpdate?.agentId,
  ].flat());

  let body = "Escalation updated";

  if (action === "REASSIGN") {
    body = `Ticket ${ticketAfterUpdate?.ticketNumber || ""} was reassigned to another agent.`;
  } else if (action === "REJECT") {
    body = `Escalation for ticket ${ticketAfterUpdate?.ticketNumber || ""} was rejected.`;
  } else if (action === "HANDLE_DIRECTLY") {
    body = `Escalation for ticket ${ticketAfterUpdate?.ticketNumber || ""} is now handled by admin support.`;
  }

  if (finalNotifyIds.length) {
    await notifyUsers(finalNotifyIds, {
      title: "Escalation updated",
      body,
      type: "ESCALATION",
      meta: { escalationRequestId: hydrated.id, ticketId: ticketAfterUpdate?.id },
    });
  }

  emitToUsers(finalNotifyIds, "escalation:updated", {
    escalation: hydrated,
    ticket: ticketAfterUpdate,
    action,
  });

  emitToUsers(
    normalizeIds([
      ticketAfterUpdate?.customerId,
      ticketAfterUpdate?.agentId,
      hydrated?.createdBy,
    ]),
    "ticket:updated",
    {
      ticket: ticketAfterUpdate,
      escalation: hydrated,
      reason: `ESCALATION_${action}`,
    }
  );

  return hydrated;
};