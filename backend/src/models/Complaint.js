import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Complaint = sequelize.define(
  "Complaint",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    ticketId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    customerId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    createdBy: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    severity: {
      type: DataTypes.ENUM("LOW", "MEDIUM", "HIGH", "CRITICAL"),
      allowNull: false,
      defaultValue: "MEDIUM",
    },
    status: {
      type: DataTypes.ENUM("OPEN", "UNDER_REVIEW", "ESCALATED", "RESOLVED"),
      allowNull: false,
      defaultValue: "OPEN",
    },
    resolutionNote: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "complaints",
    timestamps: true,
  }
);

export default Complaint;