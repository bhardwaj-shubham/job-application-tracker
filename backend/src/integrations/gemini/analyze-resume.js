import { zodToJsonSchema } from "zod-to-json-schema";

import gemini from "./gemini.js";
import { resumeAnalysisSchema } from "./schemas/resume-analysis.schema.js";

import ApiError from "../../utils/ApiError.js";
import ERROR_CODES from "../../constants/errorCodes.js";
import { ZodError } from "zod";

const MODEL = "gemini-3.6-flash";
const PROMPT_VERSION = "v1";

const SYSTEM_INSTRUCTION = `You are a technical recruiter reviewing resumes.
Compare the resume against the job description.
Return only JSON matching the exact structure requested.

Do NOT:
- Invent skills not in resume
- Consider personal information
- Include candidate name, email, phone, dates`;

const analyzeResumeAgainstJob = async ({ resumeText, jobDescription }) => {
  if (!resumeText?.trim()) {
    throw new ApiError(
      400,
      "Resume text is required",
      [],
      ERROR_CODES.AI_ANALYSIS_VALIDATION_FAILED,
    );
  }

  if (!jobDescription?.trim()) {
    throw new ApiError(
      400,
      "Job description is required",
      [],
      ERROR_CODES.AI_ANALYSIS_VALIDATION_FAILED,
    );
  }

  const prompt = `${SYSTEM_INSTRUCTION}

EVALUATE THIS MATCH (0-100):

JOB: ${jobDescription}

RESUME: ${resumeText}

Provide:
Return exactly this JSON structure:

{
  "matchScore": number,
  "summary": string,
  "matchingSkills": string[],
  "missingSkills": string[],
  "relevantExperience": string[],
  "resumeImprovements": string[],
  "keywordSuggestions": string[],
  "strengths": string[],
  "concerns": string[]
}

Rules:
- matchScore must be an integer between 0 and 100.
- Every array must contain strings only.
- Do not return objects inside these arrays.
- Do not rename fields.
- Do not add extra fields.`;

  try {
    const response = await gemini.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: zodToJsonSchema(resumeAnalysisSchema),
      },
    });

    const rawResponse = response.text;

    if (!rawResponse) {
      throw new ApiError(
        500,
        "Gemini returned an empty response",
        [],
        ERROR_CODES.AI_ANALYSIS_EMPTY_RESPONSE,
      );
    }

    let parseResponse;

    try {
      parseResponse = JSON.parse(rawResponse);
    } catch {
      throw new ApiError(
        500,
        "Gemini returned invalid JSON",
        [],
        ERROR_CODES.AI_ANALYSIS_INVALID_RESPONSE,
      );
    }

    return resumeAnalysisSchema.parse(parseResponse);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof ZodError) {
      throw new ApiError(
        500,
        "Gemini response failed schema validation",
        [],
        ERROR_CODES.AI_ANALYSIS_VALIDATION_FAILED,
      );
    }

    throw new ApiError(
      500,
      `AI analysis failed: ${error.message}`,
      [],
      ERROR_CODES.AI_ANALYSIS_FAILED,
    );
  }
};

export { analyzeResumeAgainstJob, MODEL, PROMPT_VERSION };
