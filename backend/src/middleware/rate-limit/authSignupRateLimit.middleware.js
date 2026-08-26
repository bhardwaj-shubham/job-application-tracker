import createRateLimiter from "./rateLimit.middleware.js";

const authSignupRateLimit = createRateLimiter({
  keyPrefix: "auth-signup",
  maxRequests: 10,
  windowSeconds: 15 * 60,
  keyGenerator: (req) => req.ip,
});

export default authSignupRateLimit;
