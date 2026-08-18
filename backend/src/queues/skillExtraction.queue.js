import { Queue } from "bullmq";
import connection from "../integrations/redis.js";

const skillExtractionQueue = new Queue("skill-extraction", { connection });

export default skillExtractionQueue;
