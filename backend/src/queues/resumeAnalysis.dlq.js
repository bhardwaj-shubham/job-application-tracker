import { Queue } from "bullmq";
import connection from "../integrations/redis.js";

const resumeAnalysisDLQ = new Queue("resume-analysis-dlq", {
  connection,
});

export default resumeAnalysisDLQ;
