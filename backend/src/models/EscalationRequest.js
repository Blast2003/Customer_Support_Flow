import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const EscalationRequest = sequelize.define(
  "EscalationRequest",
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
    createdBy: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    handledBy: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    targetUserId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    targetRole: {
      type: DataTypes.ENUM("ADMIN", "AGENT"),
      allowNull: false,
      defaultValue: "ADMIN",
    },
    direction: {
      type: DataTypes.ENUM("AGENT_TO_ADMIN", "ADMIN_TO_AGENT"),
      allowNull: false,
      defaultValue: "AGENT_TO_ADMIN",
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("OPEN", "UNDER_REVIEW", "APPROVED", "REJECTED", "RESOLVED"),
      allowNull: false,
      defaultValue: "OPEN",
    },
    ticketStatus: {
      type: DataTypes.ENUM("OPEN", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED"),
      allowNull: true,
    },
    resolutionNote: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    updateTicketStatus: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: "escalation_requests",
    timestamps: true,
  }
);

export default EscalationRequest;