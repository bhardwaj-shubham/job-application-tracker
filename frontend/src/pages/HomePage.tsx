import { Link } from "react-router";

import {
  ArrowRightIcon,
  BriefcaseBusinessIcon,
  FileTextIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StickyNoteIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useAuth from "@/hooks/useAuth";
import ProfileMenu from "@/components/profile/ProfileMenu";

const HomePage = () => {
  const { user } = useAuth();

  return (
    <main className="min-h-svh">
      {/* Navigation */}
      <header className="border-b">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="text-lg font-bold tracking-tight">
            JobTracker
          </Link>

          {user !== null ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost">
                <Link to="/app/dashboard">Dashboard</Link>
              </Button>

              <ProfileMenu />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost">
                <Link to="/login">Login</Link>
              </Button>

              <Button>
                <Link to="/signup">Get started</Link>
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Hero */}
      <section>
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-muted-foreground">
              <SparklesIcon className="size-4" />
              One place for your job search
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Your job search,
              <span className="block text-muted-foreground">organized.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Track applications, manage resumes, analyze your fit with AI, and
              keep notes without juggling spreadsheets and scattered documents.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg">
                <Link to="/signup" className="flex items-center gap-2">
                  Get started
                  <ArrowRightIcon className="size-4" />
                </Link>
              </Button>

              <Button size="lg" variant="outline">
                <Link to="/login">Sign in</Link>
              </Button>
            </div>
          </div>

          {/* Product preview */}
          <div className="rounded-2xl border bg-muted/30 p-4 shadow-sm sm:p-6">
            <div className="rounded-xl border bg-background p-4 shadow-sm sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Application overview</p>
                  <p className="text-xs text-muted-foreground">
                    Your current job search
                  </p>
                </div>

                <BriefcaseBusinessIcon className="size-5 text-muted-foreground" />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  ["Total", "24"],
                  ["Applied", "12"],
                  ["Interviewing", "6"],
                  ["Offered", "2"],
                  ["Rejected", "3"],
                  ["Withdrawn", "1"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-1 text-xl font-semibold">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-2">
                {[
                  ["Google", "Backend Engineer", "Interviewing"],
                  ["Amazon", "Software Engineer", "Applied"],
                  ["Acme", "Node.js Developer", "Offered"],
                ].map(([company, role, status]) => (
                  <div
                    key={`${company}-${role}`}
                    className="flex items-center justify-between gap-4 rounded-lg border p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{company}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {role}
                      </p>
                    </div>

                    <span className="shrink-0 text-xs text-muted-foreground">
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y bg-muted/20">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-muted-foreground">
              Everything you need
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Keep the entire application process together.
            </h2>

            <p className="mt-3 text-muted-foreground">
              JobTracker keeps the repetitive parts of a job search in one
              simple workflow.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <BriefcaseBusinessIcon className="size-6 text-muted-foreground" />
                <CardTitle className="mt-3">Track applications</CardTitle>
              </CardHeader>

              <CardContent className="text-sm leading-6 text-muted-foreground">
                Store company, role, status, dates, job descriptions, and links
                in one place.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <FileTextIcon className="size-6 text-muted-foreground" />
                <CardTitle className="mt-3">Manage resumes</CardTitle>
              </CardHeader>

              <CardContent className="text-sm leading-6 text-muted-foreground">
                Keep the resume associated with each application and replace or
                delete documents when needed.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <SparklesIcon className="size-6 text-muted-foreground" />
                <CardTitle className="mt-3">Analyze your fit</CardTitle>
              </CardHeader>

              <CardContent className="text-sm leading-6 text-muted-foreground">
                Compare your resume against a job description and see strengths,
                missing skills, and improvement suggestions.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section>
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 text-sm font-medium">
              <ShieldCheckIcon className="size-5" />
              Privacy-conscious by design
            </div>

            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Your resume contains personal information. We treat that
              differently.
            </h2>

            <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
              JobTracker does not need every piece of personal information in
              your resume to analyze how well it matches a job description.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border p-5">
              <div className="flex gap-4">
                <ShieldCheckIcon className="mt-0.5 size-5 shrink-0" />

                <div>
                  <h3 className="font-semibold">
                    Email and phone numbers are sanitized
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Before resume content is sent through the AI analysis
                    pipeline, detected email addresses and phone numbers are
                    replaced with placeholders.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border p-5">
              <div className="flex gap-4">
                <FileTextIcon className="mt-0.5 size-5 shrink-0" />

                <div>
                  <h3 className="font-semibold">
                    Analysis happens when you request it
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Resume analysis is triggered explicitly for an application
                    rather than continuously processing uploaded documents.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border p-5">
              <div className="flex gap-4">
                <StickyNoteIcon className="mt-0.5 size-5 shrink-0" />

                <div>
                  <h3 className="font-semibold">You control your documents</h3>

                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Resumes can be replaced or deleted from the application they
                    belong to.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/20">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="mt-10 flex flex-col gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Ready to organize your job search?
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Create an account and start tracking your applications.
              </p>
            </div>

            <Button size="lg">
              <Link to="/signup" className="flex items-center gap-2">
                Create an account
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="font-medium text-foreground">JobTracker</p>
            <p className="mt-1">© 2026 JobTracker</p>
          </div>

          <a
            href="https://github.com/bhardwaj-shubham"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 hover:text-foreground hover:underline"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="size-4 fill-current"
            >
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.3 9.4 7.88 10.92.58.1.79-.25.79-.56v-2.17c-3.2.7-3.88-1.55-3.88-1.55-.53-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.25 3.34.96.1-.74.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.47.11-3.06 0 0 .96-.31 3.15 1.18A10.9 10.9 0 0 1 12 5.34c.97 0 1.95.13 2.86.38 2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.77.11 3.06.73.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.25 5.69.41.35.77 1.04.77 2.1v3.11c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
            </svg>

            <span>Connect with me on GitHub</span>
            <ArrowRightIcon className="size-4" />
          </a>
        </div>
      </footer>
    </main>
  );
};

export default HomePage;
