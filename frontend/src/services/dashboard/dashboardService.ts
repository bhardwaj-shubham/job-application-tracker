import { apiClient } from "@/services/api/apiClient";
import type { Application } from "@/services/applications/applicationService";

type DashboardStats = {
  total: number;
  applied: number;
  interviewing: number;
  offered: number;
  rejected: number;
  withdrawn: number;
};

type Dashboard = {
  stats: DashboardStats;
  recentApplications: Application[];
};

const getDashboard = async (): Promise<Dashboard> => {
  const response = await apiClient<Dashboard>("/applications/dashboard/");

  return response.data;
};

export { getDashboard, type DashboardStats, type Dashboard };
