import { useEffect, useState } from "react";
import { useParams } from "react-router";

import ApplicationDetails from "@/components/applications/ApplicationDetails";
import {
  getApplicationById,
  updateApplication,
  type Application,
  type UpdateApplicationData,
} from "@/services/applications/applicationService";
import EditApplicationSheet from "@/components/applications/EditApplicationSheet";

const ApplicationDetailsPage = () => {
  const { id } = useParams();

  const [application, setApplication] = useState<Application | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplication = async () => {
      if (!id) {
        setError("Application with given id not found.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const application = await getApplicationById(id);

        setApplication(application);
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

    fetchApplication();
  }, [id]);

  const handleUpdate = async (data: UpdateApplicationData) => {
    if (!id) {
      throw new Error("Application ID is missing");
    }

    const updatedApplication = await updateApplication(id, data);

    setApplication(updatedApplication);
  };

  if (loading) {
    return (
      <section>
        <p>Loading application...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h1 className="text-2xl font-semibold">Application</h1>
        <div className="text-red-600">{error}</div>
      </section>
    );
  }

  if (!application) {
    return (
      <section>
        <p>Application not found.</p>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-4xl space-y-6">
      <div className="flex flex-col md:flex-row gap-5">
        <div className="w-full">
          <h1 className="text-2xl font-bold">Application Details</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View and manage your job application.
          </p>
        </div>
        <EditApplicationSheet
          application={application}
          onSubmit={handleUpdate}
        />
      </div>

      <ApplicationDetails application={application} />
    </section>
  );
};

export default ApplicationDetailsPage;
