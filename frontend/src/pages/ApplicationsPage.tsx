import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import {
  listApplications,
  type Application,
  type ApplicationPagination,
} from "@/services/applications/applicationService";
import ApplicationTable from "@/components/applications/ApplicationTable";
import ApplicationPaginationControls from "@/components/applications/ApplicationPaginationControls";

const ApplicationsPage = () => {
  const [applications, setApplications] = useState<Application[]>([]);

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<ApplicationPagination | null>(
    null,
  );
  const limit = 10;

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

        const response = await listApplications(page, limit);

        setApplications(response.applications);
        setPagination(response.pagination);
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
  }, [page]);

  if (loading) {
    return <p>Loading applications...</p>;
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold">Applications</h1>

      <div className="flex flex-col gap-4">
        <ApplicationTable
          applications={applications}
          onRowClick={handleRowClick}
        />
      </div>

      {pagination && pagination.totalPages > 1 && (
        <ApplicationPaginationControls
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          limit={pagination.limit}
          onPrevious={() => setPage((previous) => previous - 1)}
          onNext={() => setPage((previous) => previous + 1)}
        />
      )}
    </section>
  );
};

export default ApplicationsPage;
