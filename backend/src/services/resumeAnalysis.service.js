import {
  MODEL,
  PROMPT_VERSION,
} from "../integrations/gemini/analyze-resume.js";
import resumeAnalysisQueue from "../queues/resumeAnalysis.queue.js";

import * as applicationRepository from "../repositories/application.repository.js";
import * as resumeAnalysisRepository from "../repositories/resumeAnalysis.repository.js";

const verifyApplicationOwnership = async (applicationId, userId) => {
  return applicationRepository.findByIdWithDocuments(applicationId, userId);
};

const enqueueResumeAnalysis = async ({ applicationId, userId }) => {
  const application = await verifyApplicationOwnership(applicationId, userId);

  if (!application) {
    return { applicationNotFound: true };
  }

  if (!application.jobDescription) {
    return { jobDescriptionMissing: true };
  }

  const resume = application.documents.find(
    (document) => document.type === "RESUME",
  );

  if (!resume) {
    return { resumeNotFound: true };
  }

  const exisitingAnalysis =
    await resumeAnalysisRepository.findByApplicationId(applicationId);

  if (exisitingAnalysis?.status === "PROCESSING") {
    return {
      alreadyProcessing: true,
      analysisId: exisitingAnalysis.id,
    };
  }

  const analysis = exisitingAnalysis
    ? await resumeAnalysisRepository.updateToPending(exisitingAnalysis.id)
    : await resumeAnalysisRepository.create(
        applicationId,
        MODEL,
        PROMPT_VERSION,
      );

  const job = await resumeAnalysisQueue.add("analyze-resume", {
    applicationId,
    analysisId: analysis.id,
    resumeUrl: resume.url,
    jobDescription: application.jobDescription,
  });

  return { jobId: job.id, analysisId: analysis.id, status: analysis.status };
};

const getAnalysisStatus = async ({ applicationId, userId }) => {
  const application = await verifyApplicationOwnership(applicationId, userId);

  if (!application) {
    return { applicationNotFound: true };
  }

  const analysis =
    await resumeAnalysisRepository.findByApplicationId(applicationId);

  if (!analysis) {
    return { analysisNotFound: true };
  }

  return {
    id: analysis.id,
    status: analysis.status,
    applicationId: analysis.applicationId,
    createdAt: analysis.createdAt,
    updatedAt: analysis.updatedAt,

    ...(analysis.status === "COMPLETED" && {
      results: {
        matchScore: analysis.matchScore,
        summary: analysis.summary,
        matchingSkills: analysis.matchingSkills,
        missingSkills: analysis.missingSkills,
        relevantExperience: analysis.relevantExperience,
        resumeImprovement: analysis.resumeImprovements,
        keywordSuggestions: analysis.keywordSuggestions,
        strengths: analysis.strengths,
        concerns: analysis.concerns,
      },
    }),

    ...(analysis.status === "FAILED" && {
      error: {
        code: analysis.errorCode,
        message: analysis.errorMessage,
      },
    }),
  };
};

export { enqueueResumeAnalysis, getAnalysisStatus };
