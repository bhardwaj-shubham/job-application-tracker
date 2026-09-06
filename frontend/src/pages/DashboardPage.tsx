import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

import {
  getDashboard,
  type Dashboard,
} from "@/services/dashboard/dashboardService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Application } from "@/services/applications/applicationService";

const DashboardPage = () => {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getDashboard();

        setDashboard(result);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load dashboard. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const statItems = [
    { label: "Total", value: dashboard?.stats.total },
    { label: "Applied", value: dashboard?.stats.applied },
    { label: "Interviewing", value: dashboard?.stats.interviewing },
    { label: "Offered", value: dashboard?.stats.offered },
    { label: "Rejected", value: dashboard?.stats.rejected },
    { label: "Withdrawn", value: dashboard?.stats.withdrawn },
  ];

  const handleApplicationClick = (application: Application) => {
    navigate(`/app/applications/${application.id}`);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return (
      <main>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-destructive">{error}</p>
      </main>
    );
  }

  if (!dashboard) {
    return null;
  }

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your job applications.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statItems.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Recent Applications</h2>
            <p className="text-sm text-muted-foreground">
              Your most recently added applications.
            </p>
          </div>

          <Link
            to="/app/applications"
            className="text-sm font-medium hover:underline"
          >
            View all
          </Link>
        </div>

        {dashboard.recentApplications.length === 0 ? (
          <p className="text-sm text-muted-foreground">No applications yet.</p>
        ) : (
          <div className="space-y-2">
            {dashboard.recentApplications.map((application) => (
              <button
                key={application.id}
                type="button"
                onClick={() => handleApplicationClick(application)}
                className="w-full rounded-lg border p-4 text-left transition-colors hover:bg-muted/50 hover:cursor-pointer"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {application.company}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {application.role}
                    </p>
                  </div>

                  <div className="shrink-0 text-left sm:text-right">
                    <p className="text-sm font-medium">{application.status}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(application.appliedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default DashboardPage;
