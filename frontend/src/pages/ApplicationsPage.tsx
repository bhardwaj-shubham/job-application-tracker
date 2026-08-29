import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import {
  listApplications,
  type Application,
} from "@/services/applications/applicationService";
import ApplicationTable from "@/components/applications/ApplicationTable";

const ApplicationsPage = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleRowClick = (application: Application) => {
    navigate(`/app/applications/${application.id}`);
  };

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await listApplications();

        setApplications(response.applications);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Something went wrong. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (loading) {
    return <p>Loading applications...</p>;
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold">Applications</h1>
      <p className="mt-2 text-muted-foreground">
        {error ?? (applications.length === 0 && "No applications found")}
      </p>

      <div className="flex flex-col gap-4">
        <ApplicationTable
          applications={applications}
          onRowClick={handleRowClick}
        />
      </div>
    </section>
  );
};

export default ApplicationsPage;
