import { z } from "zod";

export const createEscalationRequestSchema = z.object({
  ticketId: z.number().int().positive(),
  reason: z.string().min(3),
  direction: z.enum(["AGENT_TO_ADMIN", "ADMIN_TO_AGENT", "SYSTEM_TO_ADMIN"]).optional(),
  targetUserId: z.number().int().positive().optional(),
  targetRole: z.enum(["AGENT", "ADMIN"]).optional(),
  updateTicketStatus: z.boolean().optional(),
  ticketStatus: z.enum(["OPEN", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED"]).optional(),
  metadata: z.record(z.any()).optional(),
});

export const respondEscalationRequestSchema = z.object({
  status: z.enum(["OPEN", "UNDER_REVIEW", "RESOLVED", "REJECTED", "CANCELLED"]).optional(),
  resolutionNote: z.string().optional(),
  ticketStatus: z.enum(["OPEN", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED"]).optional(),
  assignAgentId: z.number().int().positive().nullable().optional(),
  metadata: z.record(z.any()).optional(),
});