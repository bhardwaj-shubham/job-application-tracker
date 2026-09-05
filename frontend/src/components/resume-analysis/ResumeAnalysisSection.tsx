import { useState } from "react";

import { analyzeResume } from "@/services/resume-analysis/resumeAnalysisService";

import { Button } from "@/components/ui/button";
import useResumeAnalysis from "@/hooks/useResumeAnalysis";
import { Link } from "react-router";

type ResumeAnalysisSectionProps = {
  applicationId: string;
  hasResume: boolean;
};

const ResumeAnalysisSection = ({
  applicationId,
  hasResume,
}: ResumeAnalysisSectionProps) => {
  const {
    analysis,
    error: statusError,
    startPolling,
  } = useResumeAnalysis(applicationId);

  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState("");

  const analysisInProgress =
    analysis?.status === "PENDING" || analysis?.status === "PROCESSING";

  const handleAnalyze = async () => {
    try {
      setStarting(true);
      setStartError("");

      await analyzeResume(applicationId);

      startPolling();
    } catch (error) {
      if (error instanceof Error) {
        setStartError(error.message);
      } else {
        setStartError("Failed to analyze resume. Please try again.");
      }
    } finally {
      setStarting(false);
    }
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-semibold">Resume Analysis</h2>
        <p className="text-sm text-muted-foreground">
          Analyze your resume against this job description.
        </p>
      </div>

      <div className="space-y-4 ">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={handleAnalyze}
            disabled={starting || !hasResume || analysisInProgress}
          >
            {starting
              ? "Starting Analysis..."
              : analysisInProgress
                ? "Analysis in Progress..."
                : "Analyze Resume"}
          </Button>

          {analysis && (
            <Button variant="outline">
              <Link to={`/app/applications/${applicationId}/analysis`}>
                View Analysis
              </Link>
            </Button>
          )}
        </div>

        {!hasResume && (
          <p className="text-sm text-muted-foreground">
            Upload a resume before starting the analysis.
          </p>
        )}

        {startError && <p className="text-sm text-destructive">{startError}</p>}

        {statusError && (
          <p className="text-sm text-destructive">{statusError}</p>
        )}
      </div>
    </section>
  );
};

export default ResumeAnalysisSection;
