import createRateLimiter from "./rateLimit.middleware.js";

const resumeAnalysisRateLimit = createRateLimiter({
  keyPrefix: `resume-analysis`,
  maxRequests: 5,
  windowSeconds: 60 * 60,
  keyGenerator: (req) => req.user.id,
});

export { resumeAnalysisRateLimit };
