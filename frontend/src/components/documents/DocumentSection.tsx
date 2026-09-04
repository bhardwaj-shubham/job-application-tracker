import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  deleteResume,
  listResumes,
  type ResumeDocument,
} from "@/services/documents/documentService";
import DocumentUpload from "./DocumentUpload";
import ResumeDocumentCard from "./ResumeDocumentCard";

type DocumentSectionProps = {
  applicationId: string;
  onResumeChange?: (hasResume: boolean) => void;
};

const DocumentSection = ({
  applicationId,
  onResumeChange,
}: DocumentSectionProps) => {
  const [document, setDocument] = useState<ResumeDocument | null>(null);

  const [replacing, setReplacing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        setError("");

        const document = await listResumes(applicationId);
        const resume = document[0] ?? null;

        setDocument(resume);
        onResumeChange?.(resume !== null);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load document. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [applicationId]);

  const handleDelete = async () => {
    if (!document) return;

    try {
      setDeleting(true);

      await deleteResume(applicationId, document.id);

      setDocument(null);
      onResumeChange?.(false);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to delete resume. Please try again.");
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
        <CardDescription>
          Upload and manage your resume for this application.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading && (
          <p className="text-sm text-muted-foreground">Loading document...</p>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        {!loading && !error && document && !replacing && (
          <ResumeDocumentCard
            document={document}
            onReplace={() => setReplacing(true)}
            onDelete={handleDelete}
            deleting={deleting}
          />
        )}

        {!loading && !error && replacing && (
          <div className="space-y-3">
            <DocumentUpload
              applicationId={applicationId}
              onUploaded={(uploadedResume) => {
                setDocument(uploadedResume);
                setReplacing(false);
                onResumeChange?.(true);
              }}
            />

            <Button
              type="button"
              variant="ghost"
              onClick={() => setReplacing(false)}
            >
              Cancel
            </Button>
          </div>
        )}

        {!loading && !error && !document && (
          <DocumentUpload
            applicationId={applicationId}
            onUploaded={setDocument}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentSection;
