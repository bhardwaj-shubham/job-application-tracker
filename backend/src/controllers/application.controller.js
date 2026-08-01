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

const listAllApplications = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;

  const normalizedPageNo = page !== undefined ? Number(page) : 1;
  const normalizedLimit = limit !== undefined ? Number(limit) : 10;
  const normalizedStatus = status?.trim();

  if (
    page !== undefined &&
    (!Number.isInteger(normalizedPageNo) || normalizedPageNo < 1)
  ) {
    throw new ApiError(400, "Invalid page number");
  }

  if (
    limit !== undefined &&
    (!Number.isInteger(normalizedLimit) ||
      normalizedLimit < 1 ||
      normalizedLimit > 100)
  ) {
    throw new ApiError(400, "Invalid limit");
  }

  if (
    normalizedStatus &&
    !Object.values(ApplicationStatus).includes(normalizedStatus)
  ) {
    throw new ApiError(400, "Invalid status");
  }

  const [applications, totalItems] = await Promise.all([
    prisma.application.findMany({
      where: {
        userId: req.user.id,
        ...(normalizedStatus && { status: normalizedStatus }),
      },
      orderBy: { createdAt: "desc" },
      skip: (normalizedPageNo - 1) * normalizedLimit,
      take: normalizedLimit,
    }),
    prisma.application.count({
      where: {
        userId: req.user.id,
        ...(normalizedStatus && { status: normalizedStatus }),
      },
    }),
  ]);

  const applicationsWithoutUserId = applications.map(
    ({ userId, ...rest }) => rest,
  );

  const pagination = {
    currentPage: normalizedPageNo,
    totalPages: Math.ceil(totalItems / normalizedLimit),
    totalItems,
    limit: normalizedLimit,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { applications: applicationsWithoutUserId, pagination },
        "All applications fetched successfully",
      ),
    );
});

const getApplicationById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id?.trim()) {
    throw new ApiError(400, "Invalid application ID");
  }

  const application = await prisma.application.findUnique({
    where: { id, userId: req.user.id },
  });

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  const { userId, ...applicationWithoutUserId } = application;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        applicationWithoutUserId,
        "Application fetched successfully",
      ),
    );
});

export { createApplication, listAllApplications, getApplicationById };
