import { useState } from "react";

import { analyzeResume } from "@/services/resume-analysis/resumeAnalysisService";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <Card>
      <CardHeader>
        <CardTitle>Resume Analysis</CardTitle>
        <CardDescription>
          Analyze your resume against this job description.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 ">
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
          <Button variant="outline" className="mx-2">
            <Link to={`/app/applications/${applicationId}/analysis`}>
              View Analysis
            </Link>
          </Button>
        )}

        {!hasResume && (
          <p className="text-sm text-muted-foreground">
            Upload a resume before starting the analysis.
          </p>
        )}

        {startError && <p className="text-sm text-destructive">{startError}</p>}

        {statusError && (
          <p className="text-sm text-destructive">{statusError}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ResumeAnalysisSection;
