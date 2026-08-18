import "dotenv/config";
import { Worker } from "bullmq";
import connection from "../integrations/redis.js";
import prisma from "../config/db.js";

const worker = new Worker(
  "skill-extraction",
  async (job) => {
    const { applicationId, jobDescription } = job.data;

    console.log(`Processing job ${job.id} for application ${applicationId}`);

    // Mock - replace with real Gemini call later
    const mockSkills = ["JavaScript", "Node.js", "Placeholder skill"];

    await new Promise((resolve) => setTimeout(resolve, 2000)); // simulate latency

    await prisma.application.update({
      where: {
        id: applicationId,
      },
      data: {
        extractedSkills: mockSkills,
      },
    });

    return { applicationId, skills: mockSkills };
  },
  { connection },
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});

console.log("Skill extraction worker started");
