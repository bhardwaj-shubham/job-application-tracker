import ERROR_CODES from "../constants/errorCodes.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import * as resumeAnalysisService from "../services/resumeAnalysis.service.js";

const analyzeResume = asyncHandler(async (req, res) => {
  const { id: applicationId } = req.validated.params;

  const result = await resumeAnalysisService.enqueueResumeAnalysis({
    applicationId,
    userId: req.user.id,
  });

  // reached the user's request API limit
  if (result.rateLimited) {
    throw new ApiError(
      429,
      "Resume analysis rate limit exceeded. Try again later.",
      [],
      ERROR_CODES.RESUME_ANALYSIS_RATE_LIMITED,
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

  if (result.jobDescriptionMissing) {
    throw new ApiError(
      400,
      "Job description is required for analysis",
      [],
      ERROR_CODES.JOB_DESCRIPTION_MISSING,
    );
  }

  if (result.resumeNotFound) {
    throw new ApiError(
      400,
      "Resume document not found",
      [],
      ERROR_CODES.RESUME_NOT_FOUND,
    );
  }

  if (result.alreadyProcessing) {
    throw new ApiError(
      409,
      "Analysis already in progress for this application",
      [],
      ERROR_CODES.ANALYSIS_ALREADY_PROCESSING,
    );
  }

  return res.status(202).json(
    new ApiResponse(
      202,
      {
        jobId: result.jobId,
        analysisId: result.analysisId,
        status: result.status,
      },
      "Resume analysis queued",
    ),
  );
});

const getResumeAnalysisStatus = asyncHandler(async (req, res) => {
  const { id: applicationId } = req.validated.params;

  const result = await resumeAnalysisService.getAnalysisStatus({
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

  if (result.analysisNotFound) {
    throw new ApiError(
      404,
      "Resume analysis not found",
      [],
      ERROR_CODES.RESUME_ANALYSIS_NOT_FOUND,
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        result,
        "Resume analysis status fetched successfully",
      ),
    );
});

export { analyzeResume, getResumeAnalysisStatus };
