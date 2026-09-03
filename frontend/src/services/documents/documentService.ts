import { apiClient } from "@/services/api/apiClient";

type ResumeDocument = {
  id: string;
  applicationId: string;
  type: "RESUME";
  filename: string;
  mimeType: string;
  resourceType: string;
  url: string;
  publicId: string;
};

type UploadResumeData = {
  file: File;
};

const uploadResume = async (
  applicationId: string,
  data: UploadResumeData,
): Promise<ResumeDocument> => {
  const formData = new FormData();

  formData.append("file", data.file);
  formData.append("type", "RESUME");

  const response = await apiClient<ResumeDocument>(
    `/applications/${applicationId}/documents`,
    {
      method: "POST",
      body: formData,
    },
  );

  return response.data;
};

const listResumes = async (
  applicationId: string,
): Promise<ResumeDocument[]> => {
  const response = await apiClient<ResumeDocument[]>(
    `/applications/${applicationId}/documents`,
  );

  return response.data;
};

const deleteResume = async (
  applicationId: string,
  documentId: string,
): Promise<void> => {
  await apiClient(`/applications/${applicationId}/documents/${documentId}`, {
    method: "DELETE",
  });
};

export {
  uploadResume,
  listResumes,
  deleteResume,
  type ResumeDocument,
  type UploadResumeData,
};
