import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcrypt";
import { sequelize } from "../config/db.js";
import {
  User,
  Ticket,
  TicketMessage,
  Complaint,
  SLARecord,
  Notification,
  EscalationRequest,
} from "../models/index.js";

const TZ = "+07:00";

function at(dateTime) {
  return new Date(`${dateTime}${TZ}`);
}

async function ensureUser(data) {
  const [user] = await User.findOrCreate({
    where: { email: data.email },
    defaults: data,
  });
  return user;
}

async function ensureTicket(data) {
  const [ticket] = await Ticket.findOrCreate({
    where: { ticketNumber: data.ticketNumber },
    defaults: data,
  });
  return ticket;
}

async function ensureMessage(data) {
  const [message] = await TicketMessage.findOrCreate({
    where: {
      ticketId: data.ticketId,
      senderId: data.senderId,
      message: data.message,
    },
    defaults: data,
  });
  return message;
}

async function ensureComplaint(data) {
  const [complaint] = await Complaint.findOrCreate({
    where: {
      ticketId: data.ticketId,
      category: data.category,
    },
    defaults: data,
  });
  return complaint;
}

async function ensureSLA(data) {
  const [sla] = await SLARecord.findOrCreate({
    where: { ticketId: data.ticketId },
    defaults: data,
  });
  return sla;
}

async function ensureNotification(data) {
  const [notification] = await Notification.findOrCreate({
    where: {
      userId: data.userId,
      title: data.title,
      type: data.type,
    },
    defaults: data,
  });
  return notification;
}

async function ensureEscalation(data) {
  const [row] = await EscalationRequest.findOrCreate({
    where: {
      ticketId: data.ticketId,
      createdBy: data.createdBy,
      reason: data.reason,
    },
    defaults: data,
  });
  return row;
}

async function seedReportHistory() {
  try {
    await sequelize.authenticate();
    console.log("Database connected.");

    const password = await bcrypt.hash("Test@12345", 10);

    const users = {
      admin2024: await ensureUser({
        name: "Admin 2024",
        email: "admin2024@crm.test",
        password,
        googleId: null,
        role: "ADMIN",
        authProvider: "LOCAL",
        avatarUrl: "https://via.placeholder.com/150",
        isActive: true,
        createdAt: at("2024-01-05T09:00:00"),
        updatedAt: at("2024-01-05T09:00:00"),
      }),
      agent2024a: await ensureUser({
        name: "Agent 2024 A",
        email: "agent2024a@crm.test",
        password,
        googleId: null,
        role: "AGENT",
        authProvider: "LOCAL",
        avatarUrl: "https://via.placeholder.com/150",
        isActive: true,
        createdAt: at("2024-01-08T09:00:00"),
        updatedAt: at("2024-01-08T09:00:00"),
      }),
      agent2024b: await ensureUser({
        name: "Agent 2024 B",
        email: "agent2024b@crm.test",
        password,
        googleId: null,
        role: "AGENT",
        authProvider: "LOCAL",
        avatarUrl: "https://via.placeholder.com/150",
        isActive: true,
        createdAt: at("2024-02-10T09:00:00"),
        updatedAt: at("2024-02-10T09:00:00"),
      }),
      customer2024a: await ensureUser({
        name: "Customer 2024 A",
        email: "customer2024a@crm.test",
        password,
        googleId: null,
        role: "CUSTOMER",
        authProvider: "LOCAL",
        avatarUrl: "https://via.placeholder.com/150",
        isActive: true,
        createdAt: at("2024-01-12T09:00:00"),
        updatedAt: at("2024-01-12T09:00:00"),
      }),
      customer2024b: await ensureUser({
        name: "Customer 2024 B",
        email: "customer2024b@crm.test",
        password,
        googleId: null,
        role: "CUSTOMER",
        authProvider: "LOCAL",
        avatarUrl: "https://via.placeholder.com/150",
        isActive: true,
        createdAt: at("2024-03-15T09:00:00"),
        updatedAt: at("2024-03-15T09:00:00"),
      }),

      admin2025: await ensureUser({
        name: "Admin 2025",
        email: "admin2025@crm.test",
        password,
        googleId: null,
        role: "ADMIN",
        authProvider: "LOCAL",
        avatarUrl: "https://via.placeholder.com/150",
        isActive: true,
        createdAt: at("2025-01-07T09:00:00"),
        updatedAt: at("2025-01-07T09:00:00"),
      }),
      agent2025a: await ensureUser({
        name: "Agent 2025 A",
        email: "agent2025a@crm.test",
        password,
        googleId: null,
        role: "AGENT",
        authProvider: "LOCAL",
        avatarUrl: "https://via.placeholder.com/150",
        isActive: true,
        createdAt: at("2025-01-10T09:00:00"),
        updatedAt: at("2025-01-10T09:00:00"),
      }),
      agent2025b: await ensureUser({
        name: "Agent 2025 B",
        email: "agent2025b@crm.test",
        password,
        googleId: null,
        role: "AGENT",
        authProvider: "LOCAL",
        avatarUrl: "https://via.placeholder.com/150",
        isActive: true,
        createdAt: at("2025-02-14T09:00:00"),
        updatedAt: at("2025-02-14T09:00:00"),
      }),
      customer2025a: await ensureUser({
        name: "Customer 2025 A",
        email: "customer2025a@crm.test",
        password,
        googleId: null,
        role: "CUSTOMER",
        authProvider: "LOCAL",
        avatarUrl: "https://via.placeholder.com/150",
        isActive: true,
        createdAt: at("2025-01-18T09:00:00"),
        updatedAt: at("2025-01-18T09:00:00"),
      }),
      customer2025b: await ensureUser({
        name: "Customer 2025 B",
        email: "customer2025b@crm.test",
        password,
        googleId: null,
        role: "CUSTOMER",
        authProvider: "LOCAL",
        avatarUrl: "https://via.placeholder.com/150",
        isActive: true,
        createdAt: at("2025-02-20T09:00:00"),
        updatedAt: at("2025-02-20T09:00:00"),
      }),
      customer2025c: await ensureUser({
        name: "Customer 2025 C",
        email: "customer2025c@crm.test",
        password,
        googleId: null,
        role: "CUSTOMER",
        authProvider: "LOCAL",
        avatarUrl: "https://via.placeholder.com/150",
        isActive: true,
        createdAt: at("2025-03-08T09:00:00"),
        updatedAt: at("2025-03-08T09:00:00"),
      }),
    };

    const tickets = {
      t2024_1: await ensureTicket({
        ticketNumber: "TCK-2024-0001",
        subject: "Unable to reset password",
        description: "Customer cannot complete password reset after receiving the reset email.",
        status: "OPEN",
        priority: "HIGH",
        customerId: users.customer2024a.id,
        agentId: users.agent2024a.id,
        attachmentUrl: null,
        dueAt: at("2024-03-08T12:00:00"),
        createdAt: at("2024-03-01T10:00:00"),
        updatedAt: at("2024-03-01T10:00:00"),
      }),
      t2024_2: await ensureTicket({
        ticketNumber: "TCK-2024-0002",
        subject: "Payment pending after checkout",
        description: "Customer paid successfully but the order still shows pending.",
        status: "IN_PROGRESS",
        priority: "URGENT",
        customerId: users.customer2024b.id,
        agentId: users.agent2024a.id,
        attachmentUrl: null,
        dueAt: at("2024-05-12T12:00:00"),
        createdAt: at("2024-05-10T10:00:00"),
        updatedAt: at("2024-05-10T10:00:00"),
      }),
      t2024_3: await ensureTicket({
        ticketNumber: "TCK-2024-0003",
        subject: "App crash on checkout",
        description: "Application closes unexpectedly when the customer reaches checkout.",
        status: "RESOLVED",
        priority: "MEDIUM",
        customerId: users.customer2024a.id,
        agentId: users.agent2024b.id,
        attachmentUrl: null,
        dueAt: at("2024-09-20T12:00:00"),
        createdAt: at("2024-09-18T10:00:00"),
        updatedAt: at("2024-09-19T11:00:00"),
      }),

      t2025_1: await ensureTicket({
        ticketNumber: "TCK-2025-0001",
        subject: "Invoice download broken",
        description: "PDF invoice download button does not return a file.",
        status: "IN_PROGRESS",
        priority: "HIGH",
        customerId: users.customer2025a.id,
        agentId: users.agent2025a.id,
        attachmentUrl: null,
        dueAt: at("2025-02-15T12:00:00"),
        createdAt: at("2025-02-10T10:00:00"),
        updatedAt: at("2025-02-10T10:00:00"),
      }),
      t2025_2: await ensureTicket({
        ticketNumber: "TCK-2025-0002",
        subject: "Cannot update profile photo",
        description: "Customer uploads a photo but the avatar is not updated.",
        status: "WAITING",
        priority: "LOW",
        customerId: users.customer2025b.id,
        agentId: users.agent2025a.id,
        attachmentUrl: null,
        dueAt: at("2025-06-18T12:00:00"),
        createdAt: at("2025-06-14T10:00:00"),
        updatedAt: at("2025-06-15T10:00:00"),
      }),
      t2025_3: await ensureTicket({
        ticketNumber: "TCK-2025-0003",
        subject: "Dashboard filter missing",
        description: "User reports that the filter panel disappeared after the last update.",
        status: "ESCALATED",
        priority: "URGENT",
        customerId: users.customer2025c.id,
        agentId: users.agent2025b.id,
        attachmentUrl: null,
        dueAt: at("2025-09-22T12:00:00"),
        createdAt: at("2025-09-20T10:00:00"),
        updatedAt: at("2025-09-21T10:00:00"),
      }),
      t2025_4: await ensureTicket({
        ticketNumber: "TCK-2025-0004",
        subject: "Duplicate charge follow-up",
        description: "Customer sees a duplicate payment and requests review.",
        status: "CLOSED",
        priority: "HIGH",
        customerId: users.customer2025a.id,
        agentId: users.agent2025b.id,
        attachmentUrl: null,
        dueAt: at("2025-11-30T12:00:00"),
        createdAt: at("2025-11-26T10:00:00"),
        updatedAt: at("2025-11-29T10:00:00"),
      }),
    };

    await Promise.all([
      ensureMessage({
        ticketId: tickets.t2024_1.id,
        senderId: users.customer2024a.id,
        message: "I received the reset email, but the link fails.",
        attachmentUrl: null,
        seen: false,
        createdAt: at("2024-03-01T10:10:00"),
        updatedAt: at("2024-03-01T10:10:00"),
      }),
      ensureMessage({
        ticketId: tickets.t2024_1.id,
        senderId: users.agent2024a.id,
        message: "We are checking the reset flow now.",
        attachmentUrl: null,
        seen: true,
        createdAt: at("2024-03-01T10:20:00"),
        updatedAt: at("2024-03-01T10:20:00"),
      }),
      ensureMessage({
        ticketId: tickets.t2024_2.id,
        senderId: users.customer2024b.id,
        message: "My payment is complete but the order is still pending.",
        attachmentUrl: null,
        seen: false,
        createdAt: at("2024-05-10T10:05:00"),
        updatedAt: at("2024-05-10T10:05:00"),
      }),
      ensureMessage({
        ticketId: tickets.t2024_3.id,
        senderId: users.agent2024b.id,
        message: "We reproduced the crash and are pushing a fix.",
        attachmentUrl: null,
        seen: true,
        createdAt: at("2024-09-18T10:30:00"),
        updatedAt: at("2024-09-18T10:30:00"),
      }),

      ensureMessage({
        ticketId: tickets.t2025_1.id,
        senderId: users.customer2025a.id,
        message: "The invoice download button is not working.",
        attachmentUrl: null,
        seen: false,
        createdAt: at("2025-02-10T10:15:00"),
        updatedAt: at("2025-02-10T10:15:00"),
      }),
      ensureMessage({
        ticketId: tickets.t2025_1.id,
        senderId: users.agent2025a.id,
        message: "We are checking the invoice generator.",
        attachmentUrl: null,
        seen: true,
        createdAt: at("2025-02-10T10:25:00"),
        updatedAt: at("2025-02-10T10:25:00"),
      }),
      ensureMessage({
        ticketId: tickets.t2025_2.id,
        senderId: users.customer2025b.id,
        message: "I uploaded the profile photo twice, but nothing changed.",
        attachmentUrl: null,
        seen: false,
        createdAt: at("2025-06-14T10:15:00"),
        updatedAt: at("2025-06-14T10:15:00"),
      }),
      ensureMessage({
        ticketId: tickets.t2025_3.id,
        senderId: users.agent2025b.id,
        message: "This issue has been escalated for a deeper review.",
        attachmentUrl: null,
        seen: true,
        createdAt: at("2025-09-20T10:25:00"),
        updatedAt: at("2025-09-20T10:25:00"),
      }),
      ensureMessage({
        ticketId: tickets.t2025_4.id,
        senderId: users.customer2025a.id,
        message: "I want the duplicate charge reviewed and corrected.",
        attachmentUrl: null,
        seen: false,
        createdAt: at("2025-11-26T10:15:00"),
        updatedAt: at("2025-11-26T10:15:00"),
      }),
    ]);

    await Promise.all([
      ensureSLA({
        ticketId: tickets.t2024_1.id,
        responseDueAt: at("2024-03-01T12:00:00"),
        resolutionDueAt: at("2024-03-08T12:00:00"),
        firstResponseAt: at("2024-03-01T10:20:00"),
        atRiskNotifiedAt: null,
        breachedNotifiedAt: null,
        escalatedAt: null,
        breachedAt: null,
        status: "ON_TRACK",
        createdAt: at("2024-03-01T10:00:00"),
        updatedAt: at("2024-03-01T10:20:00"),
      }),
      ensureSLA({
        ticketId: tickets.t2024_2.id,
        responseDueAt: at("2024-05-10T11:00:00"),
        resolutionDueAt: at("2024-05-12T12:00:00"),
        firstResponseAt: at("2024-05-10T10:40:00"),
        atRiskNotifiedAt: at("2024-05-10T10:55:00"),
        breachedNotifiedAt: null,
        escalatedAt: at("2024-05-10T11:20:00"),
        breachedAt: at("2024-05-10T11:30:00"),
        status: "BREACHED",
        createdAt: at("2024-05-10T10:00:00"),
        updatedAt: at("2024-05-10T11:30:00"),
      }),
      ensureSLA({
        ticketId: tickets.t2024_3.id,
        responseDueAt: at("2024-09-18T12:00:00"),
        resolutionDueAt: at("2024-09-20T12:00:00"),
        firstResponseAt: at("2024-09-18T10:30:00"),
        atRiskNotifiedAt: null,
        breachedNotifiedAt: null,
        escalatedAt: null,
        breachedAt: null,
        status: "RESOLVED",
        createdAt: at("2024-09-18T10:00:00"),
        updatedAt: at("2024-09-19T11:00:00"),
      }),

      ensureSLA({
        ticketId: tickets.t2025_1.id,
        responseDueAt: at("2025-02-10T12:00:00"),
        resolutionDueAt: at("2025-02-15T12:00:00"),
        firstResponseAt: at("2025-02-10T10:25:00"),
        atRiskNotifiedAt: null,
        breachedNotifiedAt: null,
        escalatedAt: null,
        breachedAt: null,
        status: "ON_TRACK",
        createdAt: at("2025-02-10T10:00:00"),
        updatedAt: at("2025-02-10T10:25:00"),
      }),
      ensureSLA({
        ticketId: tickets.t2025_2.id,
        responseDueAt: at("2025-06-14T12:00:00"),
        resolutionDueAt: at("2025-06-18T12:00:00"),
        firstResponseAt: at("2025-06-14T10:45:00"),
        atRiskNotifiedAt: at("2025-06-14T11:30:00"),
        breachedNotifiedAt: null,
        escalatedAt: null,
        breachedAt: null,
        status: "AT_RISK",
        createdAt: at("2025-06-14T10:00:00"),
        updatedAt: at("2025-06-14T11:30:00"),
      }),
      ensureSLA({
        ticketId: tickets.t2025_3.id,
        responseDueAt: at("2025-09-20T12:00:00"),
        resolutionDueAt: at("2025-09-22T12:00:00"),
        firstResponseAt: at("2025-09-20T10:30:00"),
        atRiskNotifiedAt: null,
        breachedNotifiedAt: null,
        escalatedAt: at("2025-09-20T11:15:00"),
        breachedAt: at("2025-09-20T11:40:00"),
        status: "BREACHED",
        createdAt: at("2025-09-20T10:00:00"),
        updatedAt: at("2025-09-20T11:40:00"),
      }),
      ensureSLA({
        ticketId: tickets.t2025_4.id,
        responseDueAt: at("2025-11-26T12:00:00"),
        resolutionDueAt: at("2025-11-30T12:00:00"),
        firstResponseAt: at("2025-11-26T10:20:00"),
        atRiskNotifiedAt: null,
        breachedNotifiedAt: null,
        escalatedAt: null,
        breachedAt: null,
        status: "RESOLVED",
        createdAt: at("2025-11-26T10:00:00"),
        updatedAt: at("2025-11-29T10:00:00"),
      }),
    ]);

    await Promise.all([
      ensureComplaint({
        ticketId: tickets.t2024_2.id,
        customerId: users.customer2024b.id,
        createdBy: users.customer2024b.id,
        category: "Payment",
        description: "Payment was completed but the order remained pending.",
        severity: "HIGH",
        status: "UNDER_REVIEW",
        resolutionNote: null,
        createdAt: at("2024-05-11T09:00:00"),
        updatedAt: at("2024-05-11T09:00:00"),
      }),
      ensureComplaint({
        ticketId: tickets.t2024_3.id,
        customerId: users.customer2024a.id,
        createdBy: users.customer2024a.id,
        category: "Stability",
        description: "Checkout crashed twice and caused a bad experience.",
        severity: "MEDIUM",
        status: "RESOLVED",
        resolutionNote: "Bug fixed and confirmed with customer.",
        createdAt: at("2024-09-19T09:00:00"),
        updatedAt: at("2024-09-20T09:00:00"),
      }),

      ensureComplaint({
        ticketId: tickets.t2025_1.id,
        customerId: users.customer2025a.id,
        createdBy: users.customer2025a.id,
        category: "Billing",
        description: "Invoice download has been unavailable for two days.",
        severity: "HIGH",
        status: "UNDER_REVIEW",
        resolutionNote: null,
        createdAt: at("2025-02-11T09:00:00"),
        updatedAt: at("2025-02-11T09:00:00"),
      }),
      ensureComplaint({
        ticketId: tickets.t2025_4.id,
        customerId: users.customer2025a.id,
        createdBy: users.customer2025a.id,
        category: "Payments",
        description: "Duplicate charge was reported for review.",
        severity: "CRITICAL",
        status: "RESOLVED",
        resolutionNote: "Refund approved and processed.",
        createdAt: at("2025-11-27T09:00:00"),
        updatedAt: at("2025-11-29T09:00:00"),
      }),
    ]);

    await Promise.all([
      ensureNotification({
        userId: users.agent2024a.id,
        title: "New ticket assigned",
        body: "Ticket TCK-2024-0001 has been assigned to you.",
        type: "TICKET",
        isRead: false,
        meta: { ticketId: tickets.t2024_1.id },
        createdAt: at("2024-03-01T10:01:00"),
        updatedAt: at("2024-03-01T10:01:00"),
      }),
      ensureNotification({
        userId: users.admin2024.id,
        title: "Complaint created",
        body: "A complaint for TCK-2024-0002 needs review.",
        type: "COMPLAINT",
        isRead: false,
        meta: { ticketId: tickets.t2024_2.id },
        createdAt: at("2024-05-11T09:10:00"),
        updatedAt: at("2024-05-11T09:10:00"),
      }),
      ensureNotification({
        userId: users.customer2024a.id,
        title: "Ticket created",
        body: "Your support ticket TCK-2024-0001 was created successfully.",
        type: "TICKET",
        isRead: true,
        meta: { ticketId: tickets.t2024_1.id },
        createdAt: at("2024-03-01T10:02:00"),
        updatedAt: at("2024-03-01T10:02:00"),
      }),
      ensureNotification({
        userId: users.admin2024.id,
        title: "SLA warning",
        body: "Ticket TCK-2024-0002 is close to SLA limit.",
        type: "SLA",
        isRead: false,
        meta: { ticketId: tickets.t2024_2.id },
        createdAt: at("2024-05-10T11:20:00"),
        updatedAt: at("2024-05-10T11:20:00"),
      }),

      ensureNotification({
        userId: users.agent2025a.id,
        title: "New ticket assigned",
        body: "Ticket TCK-2025-0001 has been assigned to you.",
        type: "TICKET",
        isRead: false,
        meta: { ticketId: tickets.t2025_1.id },
        createdAt: at("2025-02-10T10:01:00"),
        updatedAt: at("2025-02-10T10:01:00"),
      }),
      ensureNotification({
        userId: users.admin2025.id,
        title: "Escalation opened",
        body: "Ticket TCK-2025-0003 was escalated for review.",
        type: "ESCALATION",
        isRead: false,
        meta: { ticketId: tickets.t2025_3.id },
        createdAt: at("2025-09-20T11:20:00"),
        updatedAt: at("2025-09-20T11:20:00"),
      }),
      ensureNotification({
        userId: users.customer2025a.id,
        title: "Complaint resolved",
        body: "Your complaint for TCK-2025-0004 was resolved.",
        type: "COMPLAINT",
        isRead: true,
        meta: { ticketId: tickets.t2025_4.id },
        createdAt: at("2025-11-29T09:30:00"),
        updatedAt: at("2025-11-29T09:30:00"),
      }),
    ]);

    await Promise.all([
      ensureEscalation({
        ticketId: tickets.t2024_2.id,
        createdBy: users.agent2024a.id,
        createdByRole: "AGENT",
        targetUserId: users.admin2024.id,
        targetUserRole: "ADMIN",
        direction: "AGENT_TO_ADMIN",
        reason: "Payment needs admin review.",
        status: "APPROVED",
        handledBy: users.admin2024.id,
        handledAt: at("2024-05-10T12:00:00"),
        metadata: { seed: true },
        createdAt: at("2024-05-10T11:40:00"),
        updatedAt: at("2024-05-10T12:00:00"),
      }),
      ensureEscalation({
        ticketId: tickets.t2025_3.id,
        createdBy: users.agent2025b.id,
        createdByRole: "AGENT",
        targetUserId: users.admin2025.id,
        targetUserRole: "ADMIN",
        direction: "AGENT_TO_ADMIN",
        reason: "Auto escalation due to SLA breach.",
        status: "APPROVED",
        handledBy: users.admin2025.id,
        handledAt: at("2025-09-20T12:10:00"),
        metadata: { auto: true },
        createdAt: at("2025-09-20T11:50:00"),
        updatedAt: at("2025-09-20T12:10:00"),
      }),
      ensureEscalation({
        ticketId: tickets.t2025_4.id,
        createdBy: users.agent2025a.id,
        createdByRole: "AGENT",
        targetUserId: users.admin2025.id,
        targetUserRole: "ADMIN",
        direction: "AGENT_TO_ADMIN",
        reason: "Duplicate charge should be reviewed by admin.",
        status: "OPEN",
        handledBy: null,
        handledAt: null,
        metadata: { seed: true },
        createdAt: at("2025-11-26T11:00:00"),
        updatedAt: at("2025-11-26T11:00:00"),
      }),
    ]);

    console.log("2024 and 2025 report seed data inserted successfully.");
  } catch (error) {
    console.error("Report history seed failed:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seedReportHistory();