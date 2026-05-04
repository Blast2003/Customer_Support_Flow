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
} from "../models/index.js";

async function seedDatabase() {
  try {
    await sequelize.authenticate();
    console.log("Database connected.");

    await sequelize.sync({ force: true });
    console.log("Tables recreated.");

    const adminPassword = await bcrypt.hash("Admin@12345", 10);
    const agentPassword = await bcrypt.hash("Agent@12345", 10);
    const customerPassword = await bcrypt.hash("Customer@12345", 10);

    const admin = await User.create({
      name: "System Admin",
      email: "admin@crm.test",
      password: adminPassword,
      googleId: null,
      role: "ADMIN",
      authProvider: "LOCAL",
      avatarUrl: "https://via.placeholder.com/150",
    });

    const agent = await User.create({
      name: "Support Agent",
      email: "agent@crm.test",
      password: agentPassword,
      googleId: null,
      role: "AGENT",
      authProvider: "LOCAL",
      avatarUrl: "https://via.placeholder.com/150",
    });

    const customer1 = await User.create({
      name: "Customer One",
      email: "customer1@gmail.test",
      password: customerPassword,
      googleId: null,
      role: "CUSTOMER",
      authProvider: "LOCAL",
      avatarUrl: "https://via.placeholder.com/150",
    });

    const customer2 = await User.create({
      name: "Customer Two",
      email: "customer2@gmail.test",
      password: customerPassword,
      googleId: null,
      role: "CUSTOMER",
      authProvider: "LOCAL",
      avatarUrl: "https://via.placeholder.com/150",
    });

    const googleCustomer = await User.create({
      name: "Google Customer",
      email: "googlecustomer@crm.test",
      password: null,
      googleId: "google-customer-001",
      role: "CUSTOMER",
      authProvider: "GOOGLE",
      avatarUrl: "https://via.placeholder.com/150",
    });

    const ticket1 = await Ticket.create({
      ticketNumber: "TCK-0001",
      subject: "Login issue with customer account",
      description: "Customer cannot log in after Google sign-in.",
      status: "OPEN",
      priority: "HIGH",
      customerId: customer1.id,
      agentId: agent.id,
      attachmentUrl: null,
      dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const ticket2 = await Ticket.create({
      ticketNumber: "TCK-0002",
      subject: "Payment not reflected",
      description: "Customer says payment was completed but order is still pending.",
      status: "IN_PROGRESS",
      priority: "URGENT",
      customerId: customer2.id,
      agentId: agent.id,
      attachmentUrl: null,
      dueAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
    });

    await TicketMessage.bulkCreate([
      {
        ticketId: ticket1.id,
        senderId: customer1.id,
        message: "I cannot log in to my account using Google.",
        attachmentUrl: null,
        seen: false,
      },
      {
        ticketId: ticket1.id,
        senderId: agent.id,
        message: "We are checking the login flow now.",
        attachmentUrl: null,
        seen: true,
      },
      {
        ticketId: ticket2.id,
        senderId: customer2.id,
        message: "My payment is completed but order still shows pending.",
        attachmentUrl: null,
        seen: false,
      },
    ]);

    await SLARecord.bulkCreate([
      {
        ticketId: ticket1.id,
        responseDueAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
        resolutionDueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        breachedAt: null,
        status: "ON_TRACK",
      },
      {
        ticketId: ticket2.id,
        responseDueAt: new Date(Date.now() + 1 * 60 * 60 * 1000),
        resolutionDueAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
        breachedAt: null,
        status: "AT_RISK",
      },
    ]);

    await Complaint.create({
      ticketId: ticket2.id,
      customerId: customer2.id,
      category: "Payment",
      description: "Payment completed but order is still pending.",
      severity: "HIGH",
      status: "UNDER_REVIEW",
      resolutionNote: null,
    });

    await Notification.bulkCreate([
      {
        userId: agent.id,
        title: "New ticket assigned",
        body: "Ticket TCK-0001 has been assigned to you.",
        type: "TICKET",
        isRead: false,
        meta: { ticketId: ticket1.id },
      },
      {
        userId: admin.id,
        title: "New complaint created",
        body: "A payment complaint has been created for review.",
        type: "COMPLAINT",
        isRead: false,
        meta: { ticketId: ticket2.id },
      },
      {
        userId: customer1.id,
        title: "Ticket received",
        body: "Your support ticket has been created successfully.",
        type: "TICKET",
        isRead: false,
        meta: { ticketId: ticket1.id },
      },
    ]);

    console.log("Seed data inserted successfully.");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seedDatabase();