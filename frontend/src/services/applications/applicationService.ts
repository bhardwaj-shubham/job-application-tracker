import type { z } from "zod";

import { apiClient } from "../api/apiClient";

import type {
  ApplicationStatus,
  createApplicationSchema,
  updateApplicationSchema,
} from "@/schemas/application";

type CreateApplicationData = z.infer<typeof createApplicationSchema>;

type UpdateApplicationData = z.infer<typeof updateApplicationSchema>;

type Application = {
  id: string;
  company: string;
  role: string;
  jobUrl: string | null;
  status: ApplicationStatus;
  appliedDate: string;
  jobDescription: string | null;
};

type ApplicationPagination = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
};

type ListApplicationResponse = {
  applications: Application[];
  pagination: ApplicationPagination;
};

const createApplication = async (data: CreateApplicationData) => {
  return apiClient("/applications", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

const listApplications = async (
  page = 1,
  limit = 10,
  status?: string,
): Promise<ListApplicationResponse> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (status) {
    params.set("status", status);
  }

  const response = await apiClient<ListApplicationResponse>(
    `/applications?${params.toString()}`,
  );

  return response.data;
};

const getApplicationById = async (id: string): Promise<Application> => {
  const response = await apiClient<Application>(`/applications/${id}`);

  return response.data;
};

const updateApplication = async (
  id: string,
  data: UpdateApplicationData,
): Promise<Application> => {
  const response = await apiClient<Application>(`/applications/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  return response.data;
};

export {
  createApplication,
  listApplications,
  getApplicationById,
  updateApplication,
  type Application,
  type ApplicationPagination,
  type UpdateApplicationData,
};
