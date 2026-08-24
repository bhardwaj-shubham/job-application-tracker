import { z } from "zod";

const resumeAnalysisSchema = z.object({
  matchScore: z.number().int().min(0).max(100),

  summary: z.string(),

  matchingSkills: z.array(z.string()),

  missingSkills: z.array(z.string()),

  relevantExperience: z.array(z.string()),

  resumeImprovements: z.array(z.string()),

  keywordSuggestions: z.array(z.string()),

  strengths: z.array(z.string()),

  concerns: z.array(z.string()),
});

export { resumeAnalysisSchema };
