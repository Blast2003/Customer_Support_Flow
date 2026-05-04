import dotenv from "dotenv";
dotenv.config();

import { sequelize } from "../config/db.js";
import {
  User,
  Ticket,
  EscalationRequest,
} from "../models/index.js";

async function seedEscalations() {
  try {
    await sequelize.authenticate();
    console.log("Database connected.");

    // ✅ ONLY create EscalationRequest table
    await EscalationRequest.sync(); 
    console.log("EscalationRequest table ready.");

    // ✅ Fetch existing data (no schema change)
    const admin = await User.findOne({ where: { email: "admin@crm.test" } });
    const agent = await User.findOne({ where: { email: "agent@crm.test" } });
    const customer1 = await User.findOne({ where: { email: "customer1@gmail.test" } });
    const customer2 = await User.findOne({ where: { email: "customer2@gmail.test" } });

    const ticket1 = await Ticket.findOne({ where: { ticketNumber: "TCK-0001" } });
    const ticket2 = await Ticket.findOne({ where: { ticketNumber: "TCK-0002" } });

    // 🛑 Guard (real-world safe)
    if (!admin || !agent) {
      throw new Error("Missing admin/agent users. Run user seed first.");
    }

    // ✅ Insert escalation: Agent → Admin
    if (ticket1) {
      await EscalationRequest.findOrCreate({
        where: {
          ticketId: ticket1.id,
          direction: "AGENT_TO_ADMIN",
        },
        defaults: {
          ticketId: ticket1.id,
          createdBy: agent.id,
          creatorRole: "AGENT",
          targetUserId: admin.id,
          targetRole: "ADMIN",
          direction: "AGENT_TO_ADMIN",
          reason: "Need admin approval for this case.",
          status: "OPEN",
          metadata: { seed: true },
        },
      });
    }

    // ✅ Insert escalation: Admin → Agent
    if (ticket2) {
      await EscalationRequest.findOrCreate({
        where: {
          ticketId: ticket2.id,
          direction: "ADMIN_TO_AGENT",
        },
        defaults: {
          ticketId: ticket2.id,
          createdBy: admin.id,
          creatorRole: "ADMIN",
          targetUserId: agent.id,
          targetRole: "AGENT",
          direction: "ADMIN_TO_AGENT",
          reason: "Please re-check payment confirmation with customer.",
          status: "OPEN",
          metadata: { seed: true },
        },
      });
    }

    console.log("Escalation seed inserted successfully.");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seedEscalations();