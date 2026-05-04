import * as escalationService from "../services/escalationRequest.service.js";
import { responseFormatter } from "../utils/responseFormatter.js";

export const createEscalation = async (req, res, next) => {
  try {
    const escalation = await escalationService.createEscalationRequest(req.body, req.user);
    res.status(201).json(responseFormatter.success(escalation, "Escalation created"));
  } catch (err) {
    next(err);
  }
};

export const getEscalations = async (req, res, next) => {
  try {
    const result = await escalationService.listEscalations(req.query, req.user);
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

export const updateEscalation = async (req, res, next) => {
  try {
    const result = await escalationService.updateEscalation(req.params.id, req.body, req.user);
    res.json(responseFormatter.success(result, "Escalation updated"));
  } catch (err) {
    next(err);
  }
};