import { consumeRateLimit } from "./rateLimit.middleware.js";

const resumeAnalysisRateLimit = (userId) => {
  consumeRateLimit({
    keyPrefix: "resume-analysis",
    identifier: userId,
    maxRequests: 5,
    windowSeconds: 60 * 60,
  });
};

export { resumeAnalysisRateLimit };
