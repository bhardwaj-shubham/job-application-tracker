import prisma from "../config/db.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

import { ApplicationStatus } from "../../generated/prisma/enums.ts";

const createApplication = asyncHandler(async (req, res) => {
  const { company, role, jobUrl, status, appliedDate, jobDescription } =
    req.validated.body;

  const newApplication = await prisma.application.create({
    data: {
      company,
      role,
      jobUrl: jobUrl || null,
      status: status || ApplicationStatus.APPLIED,
      appliedDate: appliedDate || new Date(),
      jobDescription: jobDescription || null,
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
  const { page, limit, status } = req.validated.query;

  const [applications, totalItems] = await Promise.all([
    prisma.application.findMany({
      where: {
        userId: req.user.id,
        ...(status && { status }),
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),

    prisma.application.count({
      where: {
        userId: req.user.id,
        ...(status && { status }),
      },
    }),
  ]);

  const applicationsWithoutUserId = applications.map(
    ({ userId, ...rest }) => rest,
  );

  const pagination = {
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit),
    totalItems,
    limit,
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
  const { id } = req.validated.params;

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
  const { id } = req.validated.params;
  const { company, role, jobUrl, status, appliedDate, jobDescription } =
    req.validated.body;

  const existingApplication = await prisma.application.findFirst({
    where: { id, userId: req.user.id },
  });

  if (!existingApplication) {
    throw new ApiError(404, "Application not found");
  }

  const updateData = {
    ...(company !== undefined && { company }),
    ...(role !== undefined && { role }),
    ...(jobUrl !== undefined && { jobUrl: jobUrl || null }),
    ...(status !== undefined && { status }),
    ...(appliedDate !== undefined && {
      appliedDate,
    }),
    ...(jobDescription !== undefined && {
      jobDescription: jobDescription || null,
    }),
  };

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
  const { id } = req.validated.params;

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
