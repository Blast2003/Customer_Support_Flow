import * as complaintService from "../services/complaint.service.js";
import { responseFormatter } from "../utils/responseFormatter.js";
import {
  createComplaintSchema,
  updateComplaintSchema,
  complaintsQuerySchema,
} from "../validations/complaint.validation.js";

export const createComplaint = async (req, res, next) => {
  try {
    const body = createComplaintSchema.parse(req.body);
    const complaint = await complaintService.createComplaint(body, req.user);
    res.status(201).json(responseFormatter.success(complaint, "Complaint created"));
  } catch (err) {
    next(err);
  }
};

export const getComplaints = async (req, res, next) => {
  try {
    const query = complaintsQuerySchema.parse(req.query);
    const result = await complaintService.listComplaints(query, req.user);

    res.json(
      responseFormatter.success({
        rows: result.rows,
        count: result.count,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(result.count / query.limit),
      })
    );
  } catch (err) {
    next(err);
  }
};

export const updateComplaint = async (req, res, next) => {
  try {
    const body = updateComplaintSchema.parse(req.body);
    const complaint = await complaintService.updateComplaint(req.params.id, body, req.user);
    res.json(responseFormatter.success(complaint, "Complaint updated"));
  } catch (err) {
    next(err);
  }
};