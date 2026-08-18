import ERROR_CODES from "../constants/errorCodes.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import * as skillExtractionService from "../services/skillExtraction.service.js";

const extractSkills = asyncHandler(async (req, res) => {
  const { id: applicationId } = req.validated.params;

  const result = await skillExtractionService.enqueueSkillExtraction({
    applicationId,
    userId: req.user.id,
  });

  if (result.applicationNotFound) {
    throw new ApiError(
      404,
      "Application not found",
      [],
      ERROR_CODES.APPLICATION_NOT_FOUND,
    );
  }

  return res
    .status(202)
    .json(new ApiResponse(202, result, "Skill extraction queued"));
});

const getSkillExtractionStatus = asyncHandler(async (req, res) => {
  const { id: applicationId, jobId } = req.validated.params;

  const result = await skillExtractionService.getJobStatus({
    jobId,
    applicationId,
    userId: req.user.id,
  });

  if (!result) {
    throw new ApiError(
      404,
      "Job not found",
      [],
      ERROR_CODES.SKILL_EXTRACTION_JOB_NOT_FOUND,
    );
  }

  if (result.applicationNotFound) {
    throw new ApiError(
      404,
      "Application not found",
      [],
      ERROR_CODES.APPLICATION_NOT_FOUND,
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Job status fetched successfully"));
});

export { extractSkills, getSkillExtractionStatus };
