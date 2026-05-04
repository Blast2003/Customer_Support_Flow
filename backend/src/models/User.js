import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(191),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    googleId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM("ADMIN", "AGENT", "CUSTOMER"),
      allowNull: false,
      defaultValue: "CUSTOMER",
    },
    authProvider: {
      type: DataTypes.ENUM("LOCAL", "GOOGLE"),
      allowNull: false,
      defaultValue: "LOCAL",
    },
    avatarUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "users",
    timestamps: true,
  }
);

export default User;