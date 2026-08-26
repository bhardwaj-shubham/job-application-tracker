import { beforeEach, describe, expect, it, vi } from "vitest";

import * as applicationRepository from "../../src/repositories/application.repository.js";
import * as resumeAnalysisRepository from "../../src/repositories/resumeAnalysis.repository.js";
import resumeAnalysisQueue from "../../src/queues/resumeAnalysis.queue.js";
import { resumeAnalysisRateLimit } from "../../src/middleware/rate-limit/resumeAnalysisRateLimit.middleware.js";

import {
  enqueueResumeAnalysis,
  getAnalysisStatus,
} from "../../src/services/resumeAnalysis.service.js";

vi.mock("../../src/repositories/application.repository.js", () => ({
  findByIdWithDocuments: vi.fn(),
}));

vi.mock("../../src/repositories/resumeAnalysis.repository.js", () => ({
  findByApplicationId: vi.fn(),
  create: vi.fn(),
  updateToPending: vi.fn(),
}));

vi.mock("../../src/queues/resumeAnalysis.queue.js", () => ({
  default: {
    add: vi.fn(),
  },
}));

vi.mock(
  "../../src/middleware/rate-limit/resumeAnalysisRateLimit.middleware.js",
  () => ({
    resumeAnalysisRateLimit: vi.fn(),
  }),
);

beforeEach(() => {
  vi.clearAllMocks();

  resumeAnalysisRateLimit.mockResolvedValue({
    allowed: true,
  });
});

describe("resumeAnalysis.service - enqueueResumeAnalysis", () => {
  it("returns applicationNotFound when application does not belong to user", async () => {
    applicationRepository.findByIdWithDocuments.mockResolvedValue(null);

    const result = await enqueueResumeAnalysis({
      applicationId: "app-1",
      userId: "user-1",
    });

    expect(result).toEqual({
      applicationNotFound: true,
    });

    expect(resumeAnalysisQueue.add).not.toHaveBeenCalled();
    expect(resumeAnalysisRateLimit).not.toHaveBeenCalled();
  });

  it("returns jobDescriptionMissing when job description is missing", async () => {
    applicationRepository.findByIdWithDocuments.mockResolvedValue({
      id: "app-1",
      jobDescription: null,
      documents: [],
    });

    const result = await enqueueResumeAnalysis({
      applicationId: "app-1",
      userId: "user-1",
    });

    expect(result).toEqual({
      jobDescriptionMissing: true,
    });

    expect(resumeAnalysisQueue.add).not.toHaveBeenCalled();
    expect(resumeAnalysisRateLimit).not.toHaveBeenCalled();
  });

  it("returns resumeNotFound when resume does not exist", async () => {
    applicationRepository.findByIdWithDocuments.mockResolvedValue({
      id: "app-1",
      jobDescription: "Backend engineer with Node.js experience",
      documents: [],
    });

    const result = await enqueueResumeAnalysis({
      applicationId: "app-1",
      userId: "user-1",
    });

    expect(result).toEqual({
      resumeNotFound: true,
    });

    expect(resumeAnalysisQueue.add).not.toHaveBeenCalled();
    expect(resumeAnalysisRateLimit).not.toHaveBeenCalled();
  });

  it("returns alreadyProcessing when analysis is already processing", async () => {
    applicationRepository.findByIdWithDocuments.mockResolvedValue({
      id: "app-1",
      jobDescription: "Backend engineer with Node.js experience",
      documents: [
        {
          type: "RESUME",
          url: "https://example.com/resume.pdf",
        },
      ],
    });

    resumeAnalysisRepository.findByApplicationId.mockResolvedValue({
      id: "analysis-1",
      status: "PROCESSING",
    });

    const result = await enqueueResumeAnalysis({
      applicationId: "app-1",
      userId: "user-1",
    });

    expect(result).toEqual({
      alreadyProcessing: true,
      analysisId: "analysis-1",
    });

    expect(resumeAnalysisRateLimit).not.toHaveBeenCalled();
    expect(resumeAnalysisQueue.add).not.toHaveBeenCalled();
  });

  it("returns rateLimited when user quota is exceeded", async () => {
    applicationRepository.findByIdWithDocuments.mockResolvedValue({
      id: "app-1",
      jobDescription: "Backend engineer with Node.js experience",
      documents: [
        {
          type: "RESUME",
          url: "https://example.com/resume.pdf",
        },
      ],
    });

    resumeAnalysisRepository.findByApplicationId.mockResolvedValue(null);

    resumeAnalysisRateLimit.mockResolvedValue({
      allowed: false,
      count: 6,
      remaining: 0,
    });

    const result = await enqueueResumeAnalysis({
      applicationId: "app-1",
      userId: "user-1",
    });

    expect(result).toEqual({
      rateLimited: true,
    });

    expect(resumeAnalysisRateLimit).toHaveBeenCalledWith("user-1");
    expect(resumeAnalysisRepository.create).not.toHaveBeenCalled();
    expect(resumeAnalysisQueue.add).not.toHaveBeenCalled();
  });

  it("creates a new analysis and enqueues the job", async () => {
    applicationRepository.findByIdWithDocuments.mockResolvedValue({
      id: "app-1",
      jobDescription: "Backend engineer with Node.js experience",
      documents: [
        {
          type: "RESUME",
          url: "https://example.com/resume.pdf",
        },
      ],
    });

    resumeAnalysisRepository.findByApplicationId.mockResolvedValue(null);

    resumeAnalysisRepository.create.mockResolvedValue({
      id: "analysis-1",
      status: "PENDING",
    });

    resumeAnalysisQueue.add.mockResolvedValue({
      id: "job-123",
    });

    const result = await enqueueResumeAnalysis({
      applicationId: "app-1",
      userId: "user-1",
    });

    expect(resumeAnalysisRateLimit).toHaveBeenCalledWith("user-1");

    expect(resumeAnalysisRepository.create).toHaveBeenCalled();

    expect(resumeAnalysisQueue.add).toHaveBeenCalledWith("analyze-resume", {
      applicationId: "app-1",
      analysisId: "analysis-1",
      resumeUrl: "https://example.com/resume.pdf",
      jobDescription: "Backend engineer with Node.js experience",
    });

    expect(result).toEqual({
      jobId: "job-123",
      analysisId: "analysis-1",
      status: "PENDING",
    });
  });

  it("resets an existing analysis to pending and enqueues the job", async () => {
    applicationRepository.findByIdWithDocuments.mockResolvedValue({
      id: "app-1",
      jobDescription: "Backend engineer with Node.js experience",
      documents: [
        {
          type: "RESUME",
          url: "https://example.com/resume.pdf",
        },
      ],
    });

    resumeAnalysisRepository.findByApplicationId.mockResolvedValue({
      id: "analysis-1",
      status: "FAILED",
    });

    resumeAnalysisRepository.updateToPending.mockResolvedValue({
      id: "analysis-1",
      status: "PENDING",
    });

    resumeAnalysisQueue.add.mockResolvedValue({
      id: "job-456",
    });

    const result = await enqueueResumeAnalysis({
      applicationId: "app-1",
      userId: "user-1",
    });

    expect(resumeAnalysisRepository.updateToPending).toHaveBeenCalledWith(
      "analysis-1",
    );

    expect(resumeAnalysisRepository.create).not.toHaveBeenCalled();

    expect(resumeAnalysisQueue.add).toHaveBeenCalledWith("analyze-resume", {
      applicationId: "app-1",
      analysisId: "analysis-1",
      resumeUrl: "https://example.com/resume.pdf",
      jobDescription: "Backend engineer with Node.js experience",
    });

    expect(result).toEqual({
      jobId: "job-456",
      analysisId: "analysis-1",
      status: "PENDING",
    });
  });
});

describe("resumeAnalysis.service - getAnalysisStatus", () => {
  it("returns applicationNotFound when application does not belong to user", async () => {
    applicationRepository.findByIdWithDocuments.mockResolvedValue(null);

    const result = await getAnalysisStatus({
      applicationId: "app-1",
      userId: "user-1",
    });

    expect(result).toEqual({
      applicationNotFound: true,
    });

    expect(resumeAnalysisRepository.findByApplicationId).not.toHaveBeenCalled();
  });

  it("returns analysisNotFound when analysis does not exist", async () => {
    applicationRepository.findByIdWithDocuments.mockResolvedValue({
      id: "app-1",
    });

    resumeAnalysisRepository.findByApplicationId.mockResolvedValue(null);

    const result = await getAnalysisStatus({
      applicationId: "app-1",
      userId: "user-1",
    });

    expect(result).toEqual({
      analysisNotFound: true,
    });
  });

  it("returns status without results when analysis is pending", async () => {
    const createdAt = new Date("2026-08-26T05:00:00Z");
    const updatedAt = new Date("2026-08-26T05:01:00Z");

    applicationRepository.findByIdWithDocuments.mockResolvedValue({
      id: "app-1",
    });

    resumeAnalysisRepository.findByApplicationId.mockResolvedValue({
      id: "analysis-1",
      status: "PENDING",
      applicationId: "app-1",
      createdAt,
      updatedAt,
    });

    const result = await getAnalysisStatus({
      applicationId: "app-1",
      userId: "user-1",
    });

    expect(result).toEqual({
      id: "analysis-1",
      status: "PENDING",
      applicationId: "app-1",
      createdAt,
      updatedAt,
    });
  });

  it("returns results when analysis is completed", async () => {
    const createdAt = new Date("2026-08-26T05:00:00Z");
    const updatedAt = new Date("2026-08-26T05:01:00Z");

    applicationRepository.findByIdWithDocuments.mockResolvedValue({
      id: "app-1",
    });

    resumeAnalysisRepository.findByApplicationId.mockResolvedValue({
      id: "analysis-1",
      status: "COMPLETED",
      applicationId: "app-1",
      createdAt,
      updatedAt,
      matchScore: 85,
      summary: "Strong backend match",
      matchingSkills: ["Node.js", "PostgreSQL"],
      missingSkills: ["AWS"],
      relevantExperience: ["Backend development"],
      resumeImprovements: ["Add measurable achievements"],
      keywordSuggestions: ["REST API"],
      strengths: ["Node.js experience"],
      concerns: ["Limited cloud experience"],
    });

    const result = await getAnalysisStatus({
      applicationId: "app-1",
      userId: "user-1",
    });

    expect(result).toEqual({
      id: "analysis-1",
      status: "COMPLETED",
      applicationId: "app-1",
      createdAt,
      updatedAt,
      results: {
        matchScore: 85,
        summary: "Strong backend match",
        matchingSkills: ["Node.js", "PostgreSQL"],
        missingSkills: ["AWS"],
        relevantExperience: ["Backend development"],
        resumeImprovements: ["Add measurable achievements"],
        keywordSuggestions: ["REST API"],
        strengths: ["Node.js experience"],
        concerns: ["Limited cloud experience"],
      },
    });
  });

  it("returns error details when analysis failed", async () => {
    const createdAt = new Date("2026-08-26T05:00:00Z");
    const updatedAt = new Date("2026-08-26T05:01:00Z");

    applicationRepository.findByIdWithDocuments.mockResolvedValue({
      id: "app-1",
    });

    resumeAnalysisRepository.findByApplicationId.mockResolvedValue({
      id: "analysis-1",
      status: "FAILED",
      applicationId: "app-1",
      createdAt,
      updatedAt,
      errorCode: "AI_ANALYSIS_FAILED",
      errorMessage: "Gemini request failed",
    });

    const result = await getAnalysisStatus({
      applicationId: "app-1",
      userId: "user-1",
    });

    expect(result).toEqual({
      id: "analysis-1",
      status: "FAILED",
      applicationId: "app-1",
      createdAt,
      updatedAt,
      error: {
        code: "AI_ANALYSIS_FAILED",
        message: "Gemini request failed",
      },
    });
  });
});
