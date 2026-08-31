import { useState } from "react";

import {
  createApplicationSchema,
  updateApplicationSchema,
  type ApplicationStatus,
} from "@/schemas/application";
import { getFormErrors } from "@/utils/formErrors";

import FormField from "@/components/forms/FormField";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

type ApplicationFormValues = {
  company: string;
  role: string;
  status: ApplicationStatus;
  appliedDate: Date;
  jobUrl: string;
  jobDescription: string;
};

type ApplicationFormProps = {
  initialValues?: ApplicationFormValues;
  onSubmit: (data: ApplicationFormValues) => Promise<void>;
  loading?: boolean;
  submitLabel?: string;
  mode?: "create" | "edit";
};

type ApplicationErrors = {
  company?: string;
  role?: string;
  status?: string;
  appliedDate?: string;
  jobUrl?: string;
  jobDescription?: string;
};

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  APPLIED: "Applied",
  INTERVIEWING: "Interviewing",
  OFFERED: "Offered",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

const ApplicationForm = ({
  initialValues,
  onSubmit,
  loading = false,
  submitLabel = "Create Application",
  mode = "create",
}: ApplicationFormProps) => {
  const [company, setCompany] = useState(initialValues?.company ?? "");
  const [role, setRole] = useState(initialValues?.role ?? "");
  const [status, setStatus] = useState(initialValues?.status ?? "APPLIED");
  const [appliedDate, setAppliedDate] = useState(
    initialValues?.appliedDate
      ? new Date(initialValues.appliedDate)
      : new Date(),
  );
  const [jobUrl, setJobUrl] = useState(initialValues?.jobUrl ?? "");
  const [jobDescription, setJobDescription] = useState(
    initialValues?.jobDescription ?? "",
  );

  const [errors, setErrors] = useState<ApplicationErrors>({});
  const [serverError, setServerError] = useState("");

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = {
      company,
      role,
      status,
      appliedDate,
      jobUrl,
      jobDescription,
    };

    const schema =
      mode === "edit" ? updateApplicationSchema : createApplicationSchema;
    const result = schema.safeParse(formData);

    if (!result.success) {
      setErrors(getFormErrors(result.error));
      return;
    }

    try {
      setServerError("");
      await onSubmit({
        company,
        role,
        status,
        appliedDate,
        jobUrl,
        jobDescription,
      });
    } catch (error) {
      if (error instanceof Error) {
        setServerError(error.message);
        return;
      }

      setServerError("Something went wrong. Please try again.");
    }
  };

  const handleStatusChange = (value: ApplicationStatus | null) => {
    if (value) {
      setStatus(value);
      clearFieldError("status");
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

      <div className="flex flex-col md:flex-row gap-5">
        <div className="flex flex-col gap-2 w-full md:w-1/2">
          <label htmlFor="status" className="text-sm font-medium">
            Status
          </label>

          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger id="status" className="w-full">
              <SelectValue placeholder="Select status">
                {STATUS_LABELS[status]}
              </SelectValue>
            </SelectTrigger>

            <SelectContent>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {errors.status && (
            <p className="text-sm text-destructive">{errors.status}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/2">
          <label htmlFor="appliedDate" className="text-sm font-medium">
            Applied Date
          </label>

          <Popover>
            <PopoverTrigger
              render={
                <Button
                  id="appliedDate"
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  {appliedDate.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </Button>
              }
            />

            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={appliedDate}
                onSelect={(date) => {
                  if (!date) return;

                  setAppliedDate(date);
                  clearFieldError("appliedDate");
                }}
              />
            </PopoverContent>
          </Popover>

          {errors.appliedDate && (
            <p className="text-sm text-destructive">{errors.appliedDate}</p>
          )}
        </div>
      </div>

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
        {loading ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
};

export default ApplicationForm;
