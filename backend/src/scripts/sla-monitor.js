import dotenv from "dotenv";
dotenv.config();

import { sequelize } from "../config/db.js";
import { syncAllSlaRecords } from "../services/sla.service.js";

async function run() {
  try {
    await sequelize.authenticate();
    console.log("SLA monitor connected.");

    const count = await syncAllSlaRecords();
    console.log(`SLA monitor checked ${count} tickets.`);
  } catch (error) {
    console.error("SLA monitor failed:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

run();