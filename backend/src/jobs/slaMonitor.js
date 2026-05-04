import { refreshAllSlaStatuses } from "../services/sla.service.js";

let slaTimer = null;
const INTERVAL_MS = 60 * 1000; // 1 minute

export const startSlaMonitor = async () => {
  if (slaTimer) return;

  await refreshAllSlaStatuses().catch((err) => {
    console.error("Initial SLA refresh failed:", err);
  });

  slaTimer = setInterval(() => {
    refreshAllSlaStatuses().catch((err) => {
      console.error("SLA monitor failed:", err);
    });
  }, INTERVAL_MS);
};

export const stopSlaMonitor = () => {
  if (slaTimer) {
    clearInterval(slaTimer);
    slaTimer = null;
  }
};