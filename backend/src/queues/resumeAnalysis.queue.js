import { Queue } from "bullmq";
import connection from "../integrations/redis.js";

const resumeAnalysisQueue = new Queue("resume-analysis", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
  settings: {
    maxStalledCount: 2,
    stalledInterval: 30000,
    lockDuration: 60000,
    lockRenewTime: 30000,
    retryProcessDelay: 5000,
  },
});

export default resumeAnalysisQueue;
