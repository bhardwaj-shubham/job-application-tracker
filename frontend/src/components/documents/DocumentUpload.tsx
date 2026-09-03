import React, { useRef, useState } from "react";
import { FileTextIcon, UploadIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  uploadResume,
  type ResumeDocument,
} from "@/services/documents/documentService";

type DocumentUploadProps = {
  applicationId: string;
  onUploaded: (document: ResumeDocument) => void;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const DocumentUpload = ({ applicationId, onUploaded }: DocumentUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFile = (selectedFile: File | undefined) => {
    if (!selectedFile) return;

    setError("");

    if (selectedFile.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File size must be less than 5MB.");
      return;
    }

    setFile(selectedFile);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(event.target.files?.[0]);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    handleFile(event.dataTransfer.files?.[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setLoading(true);
      setError("");

      const document = await uploadResume(applicationId, { file });

      onUploaded(document);
      setFile(null);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to upload resume. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-center"
      >
        <UploadIcon className="size-8 text-muted-foreground" />

        <div>
          <p className="font-medium">Drag and drop your resume here</p>
          <p className="text-sm text-muted-foreground">
            or choose a PDF file from your device
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleInputChange}
          className="hidden"
        />

        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
        >
          Choose PDF
        </Button>

        <p className="text-xs text-muted-foreground">PDF only · Maximum 5 MB</p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {file && !error && (
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex min-w-0 items-center gap-3">
            <FileTextIcon className="size-5 shrink-0" />

            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{file.name}</p>

              <p className="text-xs text-muted-foreground">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>

          <Button type="button" disabled={loading} onClick={handleUpload}>
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
