import { Op, fn, col, literal } from "sequelize";
import {
  Ticket,
  Complaint,
  SLARecord,
  User,
  Notification,
  EscalationRequest,
} from "../models/index.js";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function buildYearRange(year) {
  return {
    start: new Date(year, 0, 1, 0, 0, 0, 0),
    end: new Date(year + 1, 0, 1, 0, 0, 0, 0),
  };
}

function toNumber(value) {
  return Number(value || 0);
}

function formatDateLabel(date) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

async function groupCount(model, field, where) {
  const rows = await model.findAll({
    attributes: [field, [fn("COUNT", col("id")), "count"]],
    where,
    group: [field],
    raw: true,
    order: [[field, "ASC"]],
  });

  return rows.map((row) => ({
    label: row[field] ?? "UNASSIGNED",
    count: toNumber(row.count),
  }));
}

async function monthlyCount(model, where) {
  const rows = await model.findAll({
    attributes: [
      [literal("MONTH(createdAt)"), "month"],
      [fn("COUNT", col("id")), "count"],
    ],
    where,
    group: [literal("MONTH(createdAt)")],
    raw: true,
  });

  const monthMap = new Map(
    rows.map((row) => [Number(row.month), toNumber(row.count)])
  );

  return MONTH_LABELS.map((label, index) => {
    const monthNumber = index + 1;
    return {
      month: monthNumber,
      label,
      count: monthMap.get(monthNumber) || 0,
    };
  });
}

export const getAdminReport = async (year) => {
  const { start, end } = buildYearRange(year);

  const yearWhere = {
    createdAt: {
      [Op.gte]: start,
      [Op.lt]: end,
    },
  };

  const [
    ticketByStatus,
    ticketByPriority,
    complaintByStatus,
    complaintBySeverity,
    slaByStatus,
    escalationByStatus,
    notificationByType,
    ticketsMonthly,
    complaintsMonthly,
    escalationsMonthly,
    notificationsMonthly,
    slaMonthly,
    agentLoad,
    users,
    tickets,
    complaints,
    slaRecords,
    escalations,
    notifications,
    unreadNotifications,
    resolvedTickets,
    breachedSla,
  ] = await Promise.all([
    groupCount(Ticket, "status", yearWhere),
    groupCount(Ticket, "priority", yearWhere),
    groupCount(Complaint, "status", yearWhere),
    groupCount(Complaint, "severity", yearWhere),
    groupCount(SLARecord, "status", yearWhere),
    groupCount(EscalationRequest, "status", yearWhere),
    groupCount(Notification, "type", yearWhere),

    monthlyCount(Ticket, yearWhere),
    monthlyCount(Complaint, yearWhere),
    monthlyCount(EscalationRequest, yearWhere),
    monthlyCount(Notification, yearWhere),
    monthlyCount(SLARecord, yearWhere),

    Ticket.findAll({
      attributes: [
        "agentId",
        [fn("COUNT", col("Ticket.id")), "ticketCount"],
      ],
      where: yearWhere,
      include: [
        {
          association: "agent",
          attributes: ["id", "name", "email"],
          required: false,
        },
      ],
      group: [
        "Ticket.agentId",
        "agent.id",
        "agent.name",
        "agent.email",
      ],
      order: [[literal("ticketCount"), "DESC"]],
      limit: 5,
      raw: true,
      nest: true,
    }),

    User.count({ where: yearWhere }),
    Ticket.count({ where: yearWhere }),
    Complaint.count({ where: yearWhere }),
    SLARecord.count({ where: yearWhere }),
    EscalationRequest.count({ where: yearWhere }),
    Notification.count({ where: yearWhere }),
    Notification.count({ where: { ...yearWhere, isRead: false } }),
    Ticket.count({
      where: {
        ...yearWhere,
        status: {
          [Op.in]: ["RESOLVED", "CLOSED"],
        },
      },
    }),
    SLARecord.count({
      where: {
        ...yearWhere,
        status: "BREACHED",
      },
    }),
  ]);

  const monthlyActivity = MONTH_LABELS.map((label, index) => ({
    month: index + 1,
    label,
    tickets: ticketsMonthly[index]?.count || 0,
    complaints: complaintsMonthly[index]?.count || 0,
    escalations: escalationsMonthly[index]?.count || 0,
    notifications: notificationsMonthly[index]?.count || 0,
    slaRecords: slaMonthly[index]?.count || 0,
  }));

  const totalTickets = tickets || 0;
  const totalSlaRecords = slaRecords || 0;
  const totalNotifications = notifications || 0;

  const ticketResolutionRate = totalTickets
    ? Math.round((resolvedTickets / totalTickets) * 100)
    : 0;

  const slaBreachRate = totalSlaRecords
    ? Math.round((breachedSla / totalSlaRecords) * 100)
    : 0;

  const unreadNotificationRate = totalNotifications
    ? Math.round((unreadNotifications / totalNotifications) * 100)
    : 0;

  return {
    year,
    period: {
      start: start.toISOString(),
      end: new Date(end.getTime() - 1).toISOString(),
      label: `${formatDateLabel(start)} — ${formatDateLabel(
        new Date(end.getTime() - 1)
      )}`,
    },
    totals: {
      users,
      tickets,
      complaints,
      slaRecords,
      escalations,
      notifications,
      unreadNotifications,
      resolvedTickets,
      breachedSla,
    },
    rates: {
      ticketResolutionRate,
      slaBreachRate,
      unreadNotificationRate,
    },
    monthlyActivity,
    ticketByStatus,
    ticketByPriority,
    complaintByStatus,
    complaintBySeverity,
    slaByStatus,
    escalationByStatus,
    notificationByType,
    agentLoad: agentLoad.map((item) => ({
      agentId: item.agentId,
      ticketCount: toNumber(item.ticketCount),
      agent: item.agent || null,
    })),
  };
};