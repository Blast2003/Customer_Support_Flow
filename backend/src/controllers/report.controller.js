import * as reportService from "../services/report.service.js";
import { responseFormatter } from "../utils/responseFormatter.js";

export const getAdminReport = async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const currentYear = new Date().getFullYear();
    const rawYear = Number(req.query.year);
    const year =
      Number.isInteger(rawYear) && rawYear >= 2024 && rawYear <= currentYear
        ? rawYear
        : currentYear;

    const report = await reportService.getAdminReport(year);
    res.json(responseFormatter.success(report));
  } catch (err) {
    next(err);
  }
};