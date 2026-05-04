import api from "./axiosClient";

export const getAdminReportApi = (year) =>
  api.get("/reports", {
    params: { year },
  });