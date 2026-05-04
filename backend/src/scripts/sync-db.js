import dotenv from "dotenv";
dotenv.config();

import { sequelize } from "../config/db.js";
import "../models/index.js";

async function syncDatabase() {
  try {
    await sequelize.authenticate();
    console.log("Database connected.");

    await sequelize.sync({ alter: true });
    console.log("Database tables synced successfully.");
  } catch (error) {
    console.error("Sync failed:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

syncDatabase();