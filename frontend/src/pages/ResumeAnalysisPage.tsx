import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { MoveLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getApplicationById,
  type Application,
} from "@/services/applications/applicationService";
import useResumeAnalysis from "@/hooks/useResumeAnalysis";
import ResumeAnalysisResults from "@/components/resume-analysis/ResumeAnalysisResults";

const ResumeAnalysisPage = () => {
  const { id } = useParams<{ id: string }>();

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { analysis, error: analysisError } = useResumeAnalysis(id ?? "");

  useEffect(() => {
    if (!id) {
      setError("Application ID is missing.");
      setLoading(false);
      return;
    }

    const fetchApplication = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getApplicationById(id);

        setApplication(result);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to fetch applications.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  if (!id) {
    return <p>Application ID is missing.</p>;
  }

  if (loading) {
    return <p>Loading analysis...</p>;
  }

  if (error) {
    return (
      <section className="mx-auto w-full max-w-4xl">
        <p className="text-sm text-destructive">{error}</p>
      </section>
    );
  }

  if (!application) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-4xl space-y-6">
      <div className="space-y-4">
        <Button variant="ghost">
          <Link
            to={`/app/applications/${id}`}
            className="flex items-center gap-2"
          >
            <MoveLeftIcon />
            Back to Application
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl tracking-tight">
            Resume Analysis
          </CardTitle>

          <CardDescription>
            {application.role} · {application.company}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-2">
          <p className="text-sm">
            Application Status:{" "}
            <span className="font-medium">{application.status}</span>
          </p>

          {analysis && (
            <p className="text-sm">
              Analysis Status:{" "}
              <span className="font-medium">{analysis.status}</span>
            </p>
          )}

          {analysisError && (
            <p className="text-sm text-destructive">{analysisError}</p>
          )}
        </CardContent>
      </Card>

      {analysis?.status === "COMPLETED" && analysis.results && (
        <ResumeAnalysisResults results={analysis.results} />
      )}
    </section>
  );
};

export default ResumeAnalysisPage;
