import connection from "../redis.js";
import { TokenBucket } from "../../middleware/rate-limit/token-bucket.js";
import { GEMINI_THROTTLE } from "../gemini/gemini.js";

const geminiThrottle = new TokenBucket(connection, {
  key: "throttle:gemini",
  capacity: GEMINI_THROTTLE.bucketCapacity,
  requestsPerMinute: GEMINI_THROTTLE.requestsPerMinute,
});

export { geminiThrottle };
