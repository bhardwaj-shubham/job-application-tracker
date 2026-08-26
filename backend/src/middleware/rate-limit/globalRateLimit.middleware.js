import createRateLimiter from "./rateLimit.middleware.js";

const globalRateLimit = createRateLimiter({
  keyPrefix: "global",
  maxRequests: 100,
  windowSeconds: 60,
  keyGenerator: (req) => req.ip,
});

export default globalRateLimit;
