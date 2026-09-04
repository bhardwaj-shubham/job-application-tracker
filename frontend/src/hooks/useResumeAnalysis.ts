import { useEffect, useState } from "react";

import {
  getResumeAnalysisStatus,
  type ResumeAnalysis,
} from "@/services/resume-analysis/resumeAnalysisService";
import { ApiError } from "@/services/api/apiClient";

const POLL_INTERVAL = 3000;

const useResumeAnalysis = (applicationId: string) => {
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const fetchAnalysis = async () => {
      try {
        const result = await getResumeAnalysisStatus(applicationId);

        if (cancelled) return;

        setError("");
        setAnalysis(result);

        if (result.status === "PENDING" || result.status === "PROCESSING") {
          timer = setTimeout(fetchAnalysis, POLL_INTERVAL);
        }
      } catch (error) {
        if (cancelled) return;

        if (error instanceof ApiError && error.statusCode === 404) {
          setAnalysis(null);
          return;
        }

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to fetch resume analysis.");
        }
      }
    };

    fetchAnalysis();

    return () => {
      cancelled = true;

      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [applicationId, refreshKey]);

  const startPolling = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return {
    analysis,
    error,
    startPolling,
  };
};

export default useResumeAnalysis;
