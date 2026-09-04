import type { ResumeAnalysisResults as ResumeAnalysisResultsType } from "@/services/resume-analysis/resumeAnalysisService";

import MatchScore from "./MatchScore";
import { Badge } from "@/components/ui/badge";
import {
  BriefcaseIcon,
  CheckIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  CircleFadingArrowUpIcon,
  LightbulbIcon,
  TagsIcon,
  TrendingUpIcon,
  TriangleAlertIcon,
} from "lucide-react";
import AnalysisSection from "./AnalysisSection";

type ResumeAnalysisResultsProps = {
  results: ResumeAnalysisResultsType;
};

const ResumeAnalysisResults = ({ results }: ResumeAnalysisResultsProps) => {
  return (
    <div className="space-y-6">
      <MatchScore score={results.matchScore} />

      <div className="grid gap-6 md:grid-cols-2">
        <AnalysisSection title="Summary">
          {results.summary ? (
            <p className="text-sm leading-6">{results.summary}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              No summary available.
            </p>
          )}
        </AnalysisSection>

        <AnalysisSection
          title="Matching Skills"
          icon={<CheckIcon className="size-4" />}
        >
          {results.matchingSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {results.matchingSkills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No matching skills identified.
            </p>
          )}
        </AnalysisSection>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <AnalysisSection
          title="Missing Skills"
          icon={<CircleAlertIcon className="size-4" />}
        >
          {results.missingSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {results.missingSkills.map((skill) => (
                <Badge key={skill} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No missing skills identified.
            </p>
          )}
        </AnalysisSection>

        <AnalysisSection
          title="Strengths"
          icon={<TrendingUpIcon className="size-4" />}
        >
          {results.strengths.length > 0 ? (
            <div className="space-y-3">
              {results.strengths.map((strength) => (
                <div key={strength} className="flex items-start gap-3">
                  <CircleCheckIcon className="mt-0.5 size-4 shrink-0" />
                  <p className="text-sm leading-6">{strength}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No strengths identified.
            </p>
          )}
        </AnalysisSection>
      </div>

      <AnalysisSection
        title="Relevant Experience"
        icon={<BriefcaseIcon className="size-4" />}
      >
        {results.relevantExperience ? (
          <p className="text-sm leading-6">{results.relevantExperience}</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            No relevant experience identified.
          </p>
        )}
      </AnalysisSection>

      <AnalysisSection
        title="Concerns"
        icon={<TriangleAlertIcon className="size-4" />}
      >
        {results.concerns.length > 0 ? (
          <div className="space-y-3">
            {results.concerns.map((concern) => (
              <div key={concern} className="flex items-start gap-3">
                <CircleAlertIcon className="mt-0.5 size-4 shrink-0" />
                <p className="text-sm leading-6">{concern}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No concerns identified.
          </p>
        )}
      </AnalysisSection>

      <AnalysisSection
        title="Resume Improvements"
        icon={<LightbulbIcon className="size-4" />}
      >
        {results.resumeImprovements.length > 0 ? (
          <div className="space-y-3">
            {results.resumeImprovements.map((improvement) => (
              <div
                key={improvement}
                className="flex items-start gap-3 rounded-md border p-3"
              >
                <CircleFadingArrowUpIcon className="mt-0.5 size-4 shrink-0" />
                <p className="text-sm leading-6">{improvement}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No resume improvements suggested.
          </p>
        )}
      </AnalysisSection>

      <AnalysisSection
        title="Keyword Suggestions"
        icon={<TagsIcon className="size-4" />}
      >
        {results.keywordSuggestions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {results.keywordSuggestions.map((keyword) => (
              <Badge key={keyword} variant="outline">
                {keyword}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No keyword suggestions.
          </p>
        )}
      </AnalysisSection>
    </div>
  );
};

export default ResumeAnalysisResults;
