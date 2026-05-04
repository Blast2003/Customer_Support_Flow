import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const SLARecord = sequelize.define(
  "SLARecord",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    ticketId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      unique: true,
    },
    responseDueAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    resolutionDueAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
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
    breachedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("ON_TRACK", "AT_RISK", "BREACHED", "RESOLVED"),
      allowNull: false,
      defaultValue: "ON_TRACK",
    },
  },
  {
    tableName: "sla_records",
    timestamps: true,
  }
);

export default SLARecord;