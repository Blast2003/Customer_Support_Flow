import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Ticket = sequelize.define(
  "Ticket",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    ticketNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("OPEN", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED", "ESCALATED"),
      allowNull: false,
      defaultValue: "OPEN",
    },
    priority: {
      type: DataTypes.ENUM("LOW", "MEDIUM", "HIGH", "URGENT"),
      allowNull: false,
      defaultValue: "MEDIUM",
    },
    customerId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    agentId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    attachmentUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    dueAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "tickets",
    timestamps: true,
  }
);

export default Ticket;