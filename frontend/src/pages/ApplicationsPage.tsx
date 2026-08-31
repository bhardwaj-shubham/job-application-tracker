import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

import {
  listApplications,
  type Application,
  type ApplicationPagination,
} from "@/services/applications/applicationService";
import ApplicationTable from "@/components/applications/ApplicationTable";
import ApplicationPaginationControls from "@/components/applications/ApplicationPaginationControls";

const ApplicationsPage = () => {
  const [applications, setApplications] = useState<Application[]>([]);

  const [searchParams, setSearchParams] = useSearchParams();

  const [pagination, setPagination] = useState<ApplicationPagination | null>(
    null,
  );
  const limit = 5;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleRowClick = (application: Application) => {
    navigate(`/app/applications/${application.id}`);
  };

  useEffect(() => {
    const fetchApplications = async () => {
      const requestedPage = Number(searchParams.get("page"));

      const isValidPage = Number.isInteger(requestedPage) && requestedPage >= 1;
      const page = isValidPage ? requestedPage : 1;

      if (!isValidPage && searchParams.has("page")) {
        setSearchParams(
          (prev) => {
            prev.set("page", "1");
            return prev;
          },
          {
            replace: true,
          },
        );

        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await listApplications(page, limit);

        const { pagination } = response;

        if (page > pagination.totalPages && pagination.totalPages > 0) {
          setSearchParams(
            (prev) => {
              prev.set("page", String(pagination.totalPages));
              return prev;
            },
            {
              replace: true,
            },
          );
          return;
        }

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
  }, [searchParams, setSearchParams]);

  if (loading) {
    return <p>Loading applications...</p>;
  }

  if (error) {
    return (
      <section>
        <h1 className="text-2xl font-semibold">Applications</h1>
        <div className="text-red-600">{error}</div>
      </section>
    );
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold gap-4">Applications</h1>

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
          onPrevious={() => {
            setSearchParams((prev) => {
              const next = new URLSearchParams(prev);
              next.set("page", String(pagination.currentPage - 1));
              return next;
            });
          }}
          onNext={() => {
            setSearchParams((prev) => {
              const next = new URLSearchParams(prev);
              next.set("page", String(pagination.currentPage + 1));
              return next;
            });
          }}
        />
      )}
    </section>
  );
};

export default ApplicationsPage;
