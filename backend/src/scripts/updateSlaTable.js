import dotenv from "dotenv";
dotenv.config();

import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import "../models/index.js";

async function updateSlaTable() {
  try {
    await sequelize.authenticate();
    console.log("Database connected.");

    const queryInterface = sequelize.getQueryInterface();
    const table = await queryInterface.describeTable("sla_records");

    const columnsToAdd = {
      firstResponseAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      atRiskNotifiedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      breachedNotifiedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      escalatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    };

    for (const [columnName, definition] of Object.entries(columnsToAdd)) {
      if (!table[columnName]) {
        await queryInterface.addColumn("sla_records", columnName, definition);
        console.log(`Added column: sla_records.${columnName}`);
      } else {
        console.log(`Column already exists: sla_records.${columnName}`);
      }
    }

    console.log("SLA table updated successfully without deleting data.");
  } catch (error) {
    console.error("Failed to update SLA table:", error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

updateSlaTable();