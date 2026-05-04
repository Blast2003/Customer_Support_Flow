import { Op } from "sequelize";
import { User } from "../models/index.js";

export const createUser = (data) => User.create(data);

export const findUserByEmail = (email) => User.findOne({ where: { email } });

export const findUserById = (id) => User.findByPk(id);

export const findAllUsers = ({ where = {}, limit = 10, offset = 0 } = {}) =>
  User.findAndCountAll({
    where,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

export const updateUser = async (user, data) => user.update(data);

export const findAgents = () =>
  User.findAll({
    where: { role: "AGENT" },
    attributes: ["id", "name", "email", "avatarUrl", "role"],
    order: [["createdAt", "DESC"]],
  });

export const findAdmins = () =>
  User.findAll({
    where: { role: "ADMIN" },
    attributes: ["id", "name", "email", "avatarUrl", "role"],
  });