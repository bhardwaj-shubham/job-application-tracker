import prisma from "../config/db.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

import { ApplicationStatus } from "../../generated/prisma/enums.ts";

const createApplication = asyncHandler(async (req, res) => {
  const { company, role, jobUrl, status, appliedDate, jobDescription, notes } =
    req.body || {};

  if (!company?.trim() || !role?.trim()) {
    throw new ApiError(400, "Please provide company and role");
  }

  if (status && !Object.values(ApplicationStatus).includes(status)) {
    throw new ApiError(400, "Invalid application status");
  }

  const normalizedAppliedDate = appliedDate?.trim()
    ? new Date(appliedDate.trim())
    : new Date();

  if (isNaN(normalizedAppliedDate.getTime())) {
    throw new ApiError(400, "Invalid appliedDate format");
  }

  const newApplication = await prisma.application.create({
    data: {
      company: company.trim(),
      role: role.trim(),
      jobUrl: jobUrl?.trim() || null,
      status: status?.trim() || ApplicationStatus.APPLIED,
      appliedDate: normalizedAppliedDate,
      jobDescription: jobDescription?.trim() || null,
      notes: notes?.trim() || null,
      userId: req.user.id,
    },
  });

  const { userId, ...applicationWithoutUserId } = newApplication;

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        applicationWithoutUserId,
        "Application created successfully",
      ),
    );
});

export { createApplication };
