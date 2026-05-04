import { z } from "zod";

const complaintStatusSchema = z.enum([
  "OPEN",
  "UNDER_REVIEW",
  "ESCALATED",
  "RESOLVED",
]);

const complaintSeveritySchema = z.enum([
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
]);

export const createComplaintSchema = z.object({
  ticketId: z.coerce.number().int().positive(),
  category: z.string().trim().min(2).max(100),
  description: z.string().trim().max(5000).optional().nullable(),
  severity: complaintSeveritySchema.optional().default("MEDIUM"),
});

export const updateComplaintSchema = z
  .object({
    status: complaintStatusSchema.optional(),
    severity: complaintSeveritySchema.optional(),
    resolutionNote: z.string().trim().max(5000).optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const complaintsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  status: z.union([complaintStatusSchema, z.literal("")]).optional().transform((value) => value || undefined),
  ticketId: z.coerce.number().int().positive().optional(),
});