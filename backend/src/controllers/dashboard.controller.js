// controllers/dashboard.controller.js
import { Op } from "sequelize";
import {
  Ticket,
  Complaint,
  Notification,
  User,
  SLARecord,
  EscalationRequest,
} from "../models/index.js";
import { responseFormatter } from "../utils/responseFormatter.js";
import { getAgentMetrics } from "../services/ticket.service.js";

const toPlain = (item) => {
  if (!item) return item;
  return typeof item.get === "function" ? item.get({ plain: true }) : item;
};

const toPlainArray = (value) => (Array.isArray(value) ? value.map(toPlain) : []);

export const getDashboard = async (req, res, next) => {
  try {
    const { id, role } = req.user;

    if (role === "AGENT") {
      const agentMetrics = await getAgentMetrics(req.user);

      return res.json(
        responseFormatter.success({
          role,
          metrics: {
            assignedTickets: Number(agentMetrics.assignedTickets || 0),
            waitingReply: Number(agentMetrics.waitingReply || 0),
            resolvedToday: Number(agentMetrics.resolvedToday || 0),
            escalations: Number(agentMetrics.escalations || 0),
          },
          recentTickets: toPlainArray(agentMetrics.recentTickets),
        })
      );
    }

    if (role === "ADMIN") {
      const [
        users,
        agents,
        customers,
        tickets,
        openTickets,
        waitingTickets,
        resolvedTickets,
        complaints,
        slaOnTrack,
        slaAtRisk,
        slaBreached,
        recentTickets,
        recentComplaints,
      ] = await Promise.all([
        User.count(),
        User.count({ where: { role: "AGENT" } }),
        User.count({ where: { role: "CUSTOMER" } }),
        Ticket.count(),
        Ticket.count({ where: { status: "OPEN" } }),
        Ticket.count({ where: { status: "WAITING" } }),
        Ticket.count({ where: { status: "RESOLVED" } }),
        Complaint.count(),
        EscalationRequest.count({
          where: { status: { [Op.in]: ["OPEN", "UNDER_REVIEW"] } },
        }),
        SLARecord.count({ where: { status: "ON_TRACK" } }),
        SLARecord.count({ where: { status: "AT_RISK" } }),
        SLARecord.count({ where: { status: "BREACHED" } }),
        Ticket.findAll({
          order: [["createdAt", "DESC"]],
          limit: 5,
          include: [
            { association: "customer", attributes: ["id", "name", "email"] },
            { association: "agent", attributes: ["id", "name", "email"] },
            { association: "slaRecord" },
          ],
        }),
        Complaint.findAll({
          order: [["createdAt", "DESC"]],
          limit: 5,
          include: [
            { association: "ticket" },
            { association: "customer", attributes: ["id", "name", "email"] },
          ],
        }),
      ]);

      return res.json(
        responseFormatter.success({
          role,
          metrics: {
            users,
            agents,
            customers,
            tickets,
            openTickets,
            waitingTickets,
            resolvedTickets,
            complaints,
            slaOnTrack,
            slaAtRisk,
            slaBreached,
          },
          recentTickets: toPlainArray(recentTickets),
          recentComplaints: toPlainArray(recentComplaints),
        })
      );
    }

    const ticketWhere = { customerId: id };
    const complaintWhere = { customerId: id };
    const notificationWhere = { userId: id };

    const [tickets, complaints, notifications, recentTickets] = await Promise.all([
      Ticket.count({ where: ticketWhere }),
      Complaint.count({ where: complaintWhere }),
      Notification.count({ where: notificationWhere }),
      Ticket.findAll({
        where: ticketWhere,
        order: [["createdAt", "DESC"]],
        limit: 5,
      }),
    ]);

    res.json(
      responseFormatter.success({
        role,
        metrics: {
          tickets,
          complaints,
          notifications,
          users: 0,
        },
        recentTickets: toPlainArray(recentTickets),
      })
    );
  } catch (err) {
    next(err);
  }
};