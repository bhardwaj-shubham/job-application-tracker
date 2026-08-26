import "dotenv/config";
import { Worker } from "bullmq";

import resumeAnalysisDLQ from "../queues/resumeAnalysis.dlq.js";
import connection from "../integrations/redis.js";
import ERROR_CODES from "../constants/errorCodes.js";

import { extractPdfText } from "../utils/extract-pdf.js";
import { downloadFile } from "../integrations/cloudinary/download.js";
import { analyzeResumeAgainstJob } from "../integrations/gemini/analyze-resume.js";
import { transformAnalysisForDB } from "../utils/transform-analysis.js";
import * as resumeAnalysisRepository from "../repositories/resumeAnalysis.repository.js";

const QUEUE_NAME = "resume-analysis";
const CONCURRENCY = 2;

const worker = new Worker(
  QUEUE_NAME,
  async (job) => {
    const { applicationId, analysisId, resumeUrl, jobDescription } = job.data;

    console.log(
      `[resume-analysis-worker] Processing job ${job.id} ` +
        `| attempt ${job.attemptsMade + 1}/${job.opts.attempts ?? 1} ` +
        `| application ${applicationId}`,
    );

    try {
      await resumeAnalysisRepository.updateToProcessing(analysisId);

      console.log(`[resume-analysis-worker] Downloading resume`);
      const resumeBuffer = await downloadFile(resumeUrl);

      console.log("[resume-analysis-worker] Extracting text from PDF...");
      const { text: sanitizedResumeText } = await extractPdfText(resumeBuffer);

      console.log("[resume-analysis-worker] Calling Gemini for analysis...");
      const geminiAnalysis = await analyzeResumeAgainstJob({
        resumeText: sanitizedResumeText,
        jobDescription,
      });

      console.log("[resume-analysis-worker] Transforming analysis...");
      const analysisData = transformAnalysisForDB(geminiAnalysis);

      await resumeAnalysisRepository.updateToCompleted(
        analysisId,
        analysisData,
      );

      return {
        applicationId,
        analysisId,
        status: "COMPLETED",
      };
    } catch (error) {
      const errorCode = error.errorCode ?? ERROR_CODES.AI_ANALYSIS_FAILED;

      const isFinalAttempt = job.attemptsMade + 1 >= (job.opts.attempts ?? 1);

      if (isFinalAttempt) {
        try {
          await resumeAnalysisRepository.updateToFailed(
            analysisId,
            errorCode,
            error.message,
          );

          // add to dlq for further inspection
          await resumeAnalysisDLQ.add("failed-resume-analysis", {
            originalJobId: job.id,
            applicationId,
            analysisId,
            resumeUrl,
            jobDescription,
            errorCode,
            errorMessage: error.message,
            attemptsMade: job.attemptsMade + 1,
            failedAt: new Date().toISOString(),
          });
        } catch (dbError) {
          console.error(
            `[resume-analysis-worker] Failed to update error status: ${dbError.message}`,
          );
        }
      }

      // Re-throw to let bullMQ handle retries
      throw error;
    }
  },
  {
    connection,
    concurrency: CONCURRENCY,

    stalledInterval: 30_000,
    maxStalledCount: 2,

    lockDuration: 60_000,
    lockRenewTime: 30_000,
  },
);

worker.on("completed", (job) => {
  console.log(`[resume-analysis-worker] Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(
    `[resume-analysis-worker] Job ${job.id} failed ` +
      `| attempt ${job.attemptsMade}/${job.opts.attempts ?? 1} ` +
      `| ${err.message}`,
  );
});

worker.on("stalled", (jobId) => {
  console.warn(
    `[resume-analysis-worker] Job ${jobId} stalled and will be recovered`,
  );
});

worker.on("error", (error) => {
  console.error("[resume-analysis-worker] Worker error:", error.message);
});

console.log("[resume-analysis-worker] Started");

export default worker;
