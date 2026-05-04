import { z } from "zod";

export const createTicketSchema = z.object({
  subject: z.string().min(3),
  description: z.string().min(5),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  attachmentFile: z.string().optional(),
  customerId: z.number().int().positive().optional(),
  agentId: z.number().int().positive().optional(),
});

export const updateTicketSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  agentId: z.number().int().positive().nullable().optional(),
});

export const addMessageSchema = z.object({
  message: z.string().min(1),
  attachmentFile: z.string().optional(),
});