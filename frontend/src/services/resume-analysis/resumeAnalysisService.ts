import { apiClient } from "../api/apiClient";

type ResumeAnalysisStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

type ResumeAnalysisJob = {
  jobId: string;
  analysisId: string;
  status: ResumeAnalysisStatus;
};

type ResumeAnalysisResults = {
  matchScore: number | null;
  summary: string | null;
  matchingSkills: string[];
  missingSkills: string[];
  relevantExperience: string | null;
  resumeImprovements: string[];
  keywordSuggestions: string[];
  strengths: string[];
  concerns: string[];
};

type ResumeAnalysisError = {
  code: string | null;
  message: string | null;
};

type ResumeAnalysis = {
  id: string;
  status: ResumeAnalysisStatus;
  applicationId: string;
  createdAt: string;
  updatedAt: string;
  results?: ResumeAnalysisResults;
  error?: ResumeAnalysisError;
};

const analyzeResume = async (applicationId: string) => {
  const response = await apiClient<ResumeAnalysisJob>(
    `/applications/${applicationId}/analyze`,
    {
      method: "POST",
    },
  );

  return response.data;
};

const getResumeAnalysisStatus = async (applicationId: string) => {
  const response = await apiClient<ResumeAnalysis>(
    `/applications/${applicationId}/analyze`,
  );

  return response.data;
};

export {
  analyzeResume,
  getResumeAnalysisStatus,
  type ResumeAnalysis,
  type ResumeAnalysisError,
  type ResumeAnalysisJob,
  type ResumeAnalysisResults,
  type ResumeAnalysisStatus,
};
