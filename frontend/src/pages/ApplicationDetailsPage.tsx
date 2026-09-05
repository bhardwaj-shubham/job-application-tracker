import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import ApplicationDetails from "@/components/applications/ApplicationDetails";
import {
  deleteApplication,
  getApplicationById,
  updateApplication,
  type Application,
  type UpdateApplicationData,
} from "@/services/applications/applicationService";
import EditApplicationSheet from "@/components/applications/EditApplicationSheet";
import DeleteApplicationDialog from "@/components/applications/DeleteApplicationDialog";
import DocumentSection from "@/components/documents/DocumentSection";
import ResumeAnalysisSection from "@/components/resume-analysis/ResumeAnalysisSection";
import ApplicationWorkspace from "@/components/applications/ApplicationWorkspace";
import { Separator } from "@/components/ui/separator";
import NotesSection from "@/components/notes/NotesSection";

const ApplicationDetailsPage = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [application, setApplication] = useState<Application | null>(null);
  const [hasResume, setHasResume] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchApplication = async () => {
      if (!id) {
        setError("Application not found.");
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
      setError("Application ID is missing");
      setLoading(false);
      return;
    }

    const updatedApplication = await updateApplication(id, data);

    setApplication(updatedApplication);
  };

  const handleDelete = async () => {
    if (!id) {
      setError("Application ID is missing");
      setLoading(false);
      return;
    }

    try {
      setDeleting(true);

      await deleteApplication(id);

      navigate("/app/applications", {
        state: {
          successMessage: "Application deleted successfully.",
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setDeleting(false);
    }
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
        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
          <EditApplicationSheet
            application={application}
            onSubmit={handleUpdate}
          />

          <DeleteApplicationDialog
            onConfirm={handleDelete}
            loading={deleting}
          />
        </div>
      </div>

      <ApplicationDetails application={application} />

      <ApplicationWorkspace>
        <DocumentSection
          applicationId={application.id}
          onResumeChange={setHasResume}
        />

        <Separator />

        <ResumeAnalysisSection
          applicationId={application.id}
          hasResume={hasResume}
        />

        <Separator />

        <NotesSection applicationId={application.id} />
      </ApplicationWorkspace>
    </section>
  );
};

export default ApplicationDetailsPage;
