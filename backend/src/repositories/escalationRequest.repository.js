import { EscalationRequest } from "../models/index.js";

export const createEscalationRequest = (data, options = {}) =>
  EscalationRequest.create(data, options);

export const findEscalationById = (id) =>
  EscalationRequest.findByPk(id, {
    include: [
      { association: "ticket" },
      { association: "creator", attributes: ["id", "name", "email", "role"] },
      { association: "handler", attributes: ["id", "name", "email", "role"] },
      { association: "targetUser", attributes: ["id", "name", "email", "role"] },
    ],
  });

export const findEscalations = (options = {}) =>
  EscalationRequest.findAndCountAll({
    ...options,
    include: [
      { association: "ticket" },
      { association: "creator", attributes: ["id", "name", "email", "role"] },
      { association: "handler", attributes: ["id", "name", "email", "role"] },
      { association: "targetUser", attributes: ["id", "name", "email", "role"] },
    ],
    distinct: true,
  });