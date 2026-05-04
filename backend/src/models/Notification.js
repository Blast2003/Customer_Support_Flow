import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Notification = sequelize.define(
  "Notification",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "INFO",
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    meta: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: "notifications",
    timestamps: true,
  }
);

export default Notification;