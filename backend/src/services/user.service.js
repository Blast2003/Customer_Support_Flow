import { Op } from "sequelize";
import * as userRepo from "../repositories/user.repository.js";

function buildUserWhere(query = {}) {
  const where = {};

  if (query.role) {
    where.role = query.role;
  }

  if (query.q) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${query.q}%` } },
      { email: { [Op.iLike]: `%${query.q}%` } },
    ];
  }

  return where;
}

export const listUsers = async (query, currentUser) => {
  if (currentUser.role !== "ADMIN") {
    throw Object.assign(new Error("Forbidden"), { status: 403 });
  }

  const page = Math.max(parseInt(query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(query.limit || "10", 10), 1), 100);
  const offset = (page - 1) * limit;

  const where = buildUserWhere(query);
  return userRepo.findAllUsers({ where, limit, offset });
};

export const updateUser = async (id, data, currentUser) => {
  if (currentUser.role !== "ADMIN") {
    throw Object.assign(new Error("Forbidden"), { status: 403 });
  }

  const user = await userRepo.findUserById(id);
  if (!user) {
    throw Object.assign(new Error("User not found"), { status: 404 });
  }

  const allowed = {};
  if (data.name !== undefined) allowed.name = data.name;
  if (data.email !== undefined) allowed.email = data.email;
  if (data.role !== undefined) allowed.role = data.role;
  if (data.avatarUrl !== undefined) allowed.avatarUrl = data.avatarUrl;

  await userRepo.updateUser(user, allowed);
  return user.reload();
};

export const listAgents = async (currentUser) => {
  if (currentUser.role !== "ADMIN") {
    throw Object.assign(new Error("Forbidden"), { status: 403 });
  }
  return userRepo.findAgents();
};