import { ApplicationStatus } from "../../generated/prisma/enums.ts";

import ERROR_CODES from "../constants/errorCodes.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

import * as applicationService from "../services/application.service.js";

const createApplication = asyncHandler(async (req, res) => {
  const newApplication = await applicationService.createApplication({
    ...req.validated.body,
    userId: req.user.id,
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
  const result = await applicationService.listApplications({
    ...req.validated.query,
    userId: req.user.id,
  });

  const applicationsWithoutUserId = result.applications.map(
    ({ userId, ...rest }) => rest,
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        applications: applicationsWithoutUserId,
        pagination: result.pagination,
      },
      "All applications fetched successfully",
    ),
  );
});

const getApplicationById = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;

  const application = await applicationService.getApplicationById({
    id,
    userId: req.user.id,
  });

  if (!application) {
    throw new ApiError(
      404,
      "Application not found",
      [],
      ERROR_CODES.APPLICATION_NOT_FOUND,
    );
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

  const application = await applicationService.updateApplication({
    id,
    userId: req.user.id,
    ...req.validated.body,
  });

  if (!application) {
    throw new ApiError(
      404,
      "Application not found",
      [],
      ERROR_CODES.APPLICATION_NOT_FOUND,
    );
  }

  const { userId, ...applicationWithoutUserId } = application;

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

  const application = await applicationService.deleteAplication({
    id,
    userId: req.user.id,
  });

  if (!application) {
    throw new ApiError(
      404,
      "Application not found",
      [],
      ERROR_CODES.APPLICATION_NOT_FOUND,
    );
  }

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
