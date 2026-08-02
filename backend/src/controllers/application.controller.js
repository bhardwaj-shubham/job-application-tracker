import prisma from "../config/db.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

import { ApplicationStatus } from "../../generated/prisma/enums.ts";

const createApplication = asyncHandler(async (req, res) => {
  const { company, role, jobUrl, status, appliedDate, jobDescription } =
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

  const application = await prisma.application.findFirst({
    where: { id, userId: req.user.id },
    include: {
      notes: {
        orderBy: { createdAt: "desc" },
      },
    },
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

const updateApplicationById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { company, role, jobUrl, status, appliedDate, jobDescription } =
    req.body || {};

  if (!id?.trim()) {
    throw new ApiError(400, "Invalid application ID");
  }

  const existingApplication = await prisma.application.findFirst({
    where: { id, userId: req.user.id },
  });

  if (!existingApplication) {
    throw new ApiError(404, "Application not found");
  }

  let normalizedAppliedDate;
  if (appliedDate !== undefined) {
    normalizedAppliedDate = new Date(appliedDate?.trim());
    if (isNaN(normalizedAppliedDate.getTime())) {
      throw new ApiError(400, "Invalid appliedDate format");
    }
  }

  const updateData = {
    ...(company !== undefined && { company: company?.trim() }),
    ...(role !== undefined && { role: role?.trim() }),
    ...(jobUrl !== undefined && { jobUrl: jobUrl?.trim() || null }),
    ...(status !== undefined && { status }),
    ...(normalizedAppliedDate !== undefined && {
      appliedDate: normalizedAppliedDate,
    }),
    ...(jobDescription !== undefined && {
      jobDescription: jobDescription?.trim() || null,
    }),
  };

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, "Please provide at least one field to update");
  }

  if (
    status !== undefined &&
    !Object.values(ApplicationStatus).includes(status)
  ) {
    throw new ApiError(400, "Invalid application status");
  }
  const statusChanged =
    status !== undefined && status !== existingApplication.status;

  const [updatedApplication] = await prisma.$transaction([
    prisma.application.update({
      where: { id },
      data: updateData,
    }),
    ...(statusChanged
      ? [
          prisma.statusHistory.create({
            data: {
              applicationId: id,
              status,
            },
          }),
        ]
      : []),
  ]);

  const { userId, ...applicationWithoutUserId } = updatedApplication;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        applicationWithoutUserId,
        "Application updated successfully",
      ),
    );
});

const deleteApplicationById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id?.trim()) {
    throw new ApiError(400, "Invalid application ID");
  }

  const existingApplication = await prisma.application.findFirst({
    where: { id, userId: req.user.id },
  });

  if (!existingApplication) {
    throw new ApiError(404, "Application not found");
  }

  await prisma.application.delete({
    where: { id },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Application deleted successfully"));
});

export {
  createApplication,
  listAllApplications,
  getApplicationById,
  updateApplicationById,
  deleteApplicationById,
};
