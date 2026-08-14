import { z } from "zod";
import { ApplicationStatus } from "../../generated/prisma/enums.ts";

const applicationStatus = z.enum(ApplicationStatus);

const createApplicationSchema = z.object({
  company: z
    .string()
    .trim()
    .min(1, "Company is required")
    .max(200, "Company must not exceed 200 characters"),
  role: z
    .string()
    .trim()
    .min(1, "Role is required")
    .max(200, "Role must not exceed 200 characters"),
  jobUrl: z
    .string()
    .trim()
    .max(2048, "Job URL must not exceed 2048 characters")
    .refine((val) => val === "" || z.string().url().safeParse(val).success, {
      message: "Invalid job URL",
    })
    .optional(),
  status: applicationStatus.optional(),
  appliedDate: z.coerce.date().optional(),
  jobDescription: z
    .string()
    .trim()
    .max(20_000, "Job description must not exceed 20,000 characters")
    .optional(),
});

const updateApplicationSchema = z
  .object({
    company: z
      .string()
      .trim()
      .min(1, "Company cannot be empty")
      .max(200, "Company must not exceed 200 characters")
      .optional(),
    role: z
      .string()
      .trim()
      .min(1, "Role cannot be empty")
      .max(200, "Role must not exceed 200 characters")
      .optional(),
    jobUrl: z
      .string()
      .trim()
      .max(2048, "Job URL must not exceed 2048 characters")
      .refine((val) => val === "" || z.string().url().safeParse(val).success, {
        message: "Invalid job URL",
      })
      .optional(),
    status: applicationStatus.optional(),
    appliedDate: z.coerce.date().optional(),
    jobDescription: z
      .string()
      .trim()
      .max(20_000, "Job description must not exceed 20,000 characters")
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "Please provide at least one field to update",
  );

const applicationIdSchema = z.object({
  id: z.string().min(1, "Invalid application ID"),
});

const listApplicationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit must not exceed 100")
    .default(10),
  status: applicationStatus.optional(),
});

export {
  createApplicationSchema,
  updateApplicationSchema,
  applicationIdSchema,
  listApplicationsQuerySchema,
};
