import { User } from "../models/index.js";
import { responseFormatter } from "../utils/responseFormatter.js";

export const getCustomers = async (req, res, next) => {
  try {
    const customers = await User.findAll({ where: { role: "CUSTOMER" }, order: [["createdAt", "DESC"]] });
    res.json(responseFormatter.success(customers));
  } catch (err) {
    next(err);
  }
};
