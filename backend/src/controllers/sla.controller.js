import * as slaService from "../services/sla.service.js";
import { responseFormatter } from "../utils/responseFormatter.js";

export const getSLA = async (req, res, next) => {
  try {
    const result = await slaService.listSLA(req.query, req.user);
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

export const getSlaSummary = async (req, res, next) => {
  try {
    const summary = await slaService.getSlaSummary(req.user);
    res.json(responseFormatter.success(summary));
  } catch (err) {
    next(err);
  }
};