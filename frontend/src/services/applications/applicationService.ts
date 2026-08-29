import { apiClient } from "../api/apiClient";

import type { z } from "zod";
import type { createApplicationSchema } from "../../schemas/application";

type CreateApplicationData = z.infer<typeof createApplicationSchema>;

type Application = {
  id: string;
  company: string;
  role: string;
  jobUrl: string;
  status: string;
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
  paginations: ApplicationPagination;
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

export { createApplication, listApplications, type Application };
