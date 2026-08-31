import type { Application } from "@/services/applications/applicationService";
import { Card, CardContent } from "@/components/ui/card";

type ApplicationDetailsProps = {
  application: Application;
};

const ApplicationDetails = ({ application }: ApplicationDetailsProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold">{application.company}</h2>
              <p className="text-muted-foreground">{application.role}</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="mt-1 font-medium">{application.status}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Applied</p>
                <p className="mt-1 font-medium">
                  {new Date(application.appliedDate).toDateString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground">Job URL</p>

              {application.jobUrl ? (
                <a
                  href={application.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block break-all text-sm underline"
                >
                  {application.jobUrl}
                </a>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">
                  No job URL provided.
                </p>
              )}
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Job Description</p>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-7">
                {application.jobDescription || "No job description provided."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicationDetails;
