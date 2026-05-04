import * as userService from "../services/user.service.js";
import { responseFormatter } from "../utils/responseFormatter.js";

export const getUsers = async (req, res, next) => {
  try {
    const result = await userService.listUsers(req.query, req.user);
    const limit = Number(req.query.limit || 10);

    res.json(
      responseFormatter.success({
        rows: result.rows,
        count: result.count,
        page: Number(req.query.page || 1),
        limit,
        totalPages: Math.ceil(result.count / limit),
      })
    );
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body, req.user);
    res.json(responseFormatter.success(user, "User updated"));
  } catch (err) {
    next(err);
  }
};

export const getAgents = async (req, res, next) => {
  try {
    const agents = await userService.listAgents(req.user);
    res.json(responseFormatter.success(agents));
  } catch (err) {
    next(err);
  }
};