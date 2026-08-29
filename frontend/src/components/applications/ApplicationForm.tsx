import { useState } from "react";

import { createApplicationSchema } from "../../schemas/application";
import { getFormErrors } from "../../utils/formErrors";

import FormField from "../forms/FormField";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ApplicationFormProps = {
  onSubmit: (data: {
    company: string;
    role: string;
    jobUrl?: string;
    jobDescription?: string;
  }) => Promise<void>;
  loading?: boolean;
};

type ApplicationErrors = {
  company?: string;
  role?: string;
  jobUrl?: string;
  jobDescription?: string;
};

const ApplicationForm = ({
  onSubmit,
  loading = false,
}: ApplicationFormProps) => {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const [errors, setErrors] = useState<ApplicationErrors>({});
  const [serverError, setServerError] = useState("");

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = createApplicationSchema.safeParse({
      company,
      role,
      jobUrl,
      jobDescription,
    });

    if (!result.success) {
      setErrors(getFormErrors(result.error));
      return;
    }

    try {
      setServerError("");
      await onSubmit(result.data);
    } catch (error) {
      if (error instanceof Error) {
        setServerError(error.message);
        return;
      }

      setServerError("Something went wrong. Please try again.");
    }
  };

  const clearFieldError = (field: keyof ApplicationErrors) => {
    if (errors[field]) {
      setErrors((previous) => ({
        ...previous,
        [field]: undefined,
      }));
    }

    if (serverError) {
      setServerError("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <FormField
        id="company"
        name="company"
        label="Company"
        type="text"
        value={company}
        onChange={(value) => {
          setCompany(value);
          clearFieldError("company");
        }}
        error={errors.company}
        placeholder="e.g. Google"
      />

      <FormField
        id="role"
        name="role"
        label="Role"
        type="text"
        value={role}
        onChange={(value) => {
          setRole(value);
          clearFieldError("role");
        }}
        error={errors.role}
        placeholder="e.g. Backend Engineer"
      />

      <FormField
        id="jobUrl"
        name="jobUrl"
        label="Job URL"
        type="url"
        value={jobUrl}
        onChange={(value) => {
          setJobUrl(value);
          clearFieldError("jobUrl");
        }}
        error={errors.jobUrl}
        placeholder="https://example.com/jobs/123"
      />

      <div className="flex flex-col gap-2">
        <label htmlFor="jobDescription" className="text-sm font-medium">
          Job Description
        </label>

        <Textarea
          id="jobDescription"
          value={jobDescription}
          onChange={(event) => {
            setJobDescription(event.target.value);
            clearFieldError("jobDescription");
          }}
          placeholder="Paste the job description here..."
          rows={12}
        />

        {errors.jobDescription && (
          <p className="text-sm text-destructive">{errors.jobDescription}</p>
        )}
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Application"}
      </Button>
    </form>
  );
};

export default ApplicationForm;
