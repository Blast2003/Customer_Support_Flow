import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const TicketMessage = sequelize.define(
  "TicketMessage",
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
    senderId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    attachmentUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    seen: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "ticket_messages",
    timestamps: true,
  }
);

export default TicketMessage;