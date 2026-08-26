import connection from "../../integrations/redis.js";
import ApiError from "../../utils/ApiError.js";

export const consumeRateLimit = async ({
  keyPrefix,
  identifier,
  maxRequests,
  windowSeconds,
}) => {
  const key = `rate-limit:${keyPrefix}:${identifier}`;

  const count = await connection.incr(key);

  if (count === 1) {
    await connection.expire(key, windowSeconds);
  }

  return {
    allowed: count <= maxRequests,
    count,
    remaining: Math.max(0, maxRequests - count),
  };
};

const createRateLimiter = ({
  keyPrefix,
  maxRequests,
  windowSeconds,
  keyGenerator = (req) => req.ip,
}) => {
  return async (req, _, next) => {
    const identifier = keyGenerator(req);

    const result = await consumeRateLimit({
      keyPrefix,
      identifier,
      maxRequests,
      windowSeconds,
    });

    if (!result.allowed) {
      throw new ApiError(
        429,
        "Too many requests. Try again later.",
        [],
        "RATE_LIMITED",
      );
    }

    next();
  };
};

export default createRateLimiter;
