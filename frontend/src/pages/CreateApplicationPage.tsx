import { useNavigate } from "react-router";

import ApplicationForm from "@/components/applications/ApplicationForm";
import { createApplication } from "@/services/applications/applicationService";
import { useState } from "react";

type CreateApplicationData = {
  company: string;
  role: string;
  jobUrl?: string;
  jobDescription?: string;
};

const CreateApplicationPage = () => {
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (data: CreateApplicationData) => {
    try {
      setLoading(true);

      await createApplication(data);

      navigate("/app/applications");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full max-w-2xl md:w-1/2 flex flex-col mx-auto gap-4">
      <div className="mb-6 text-center">
        <h1 className="font-semibold text-2xl">Create Application</h1>
        <p className="text-muted-foreground">
          Add a job application to your tracker.
        </p>
      </div>

      <ApplicationForm onSubmit={handleSubmit} loading={loading} />
    </section>
  );
};

export default CreateApplicationPage;
