import connection from "../../integrations/redis.js";
import ApiError from "../../utils/ApiError.js";

const createRateLimiter = ({
  keyPrefix,
  maxRequests,
  windowSeconds,
  keyGenerator = (req) => req.ip,
}) => {
  return async (req, _, next) => {
    const identifier = keyGenerator(req);
    const key = `rate-limit:${keyPrefix}:${identifier}`;

    const count = await connection.incr(key);

    if (count === 1) {
      await connection.expire(key, windowSeconds);
    }

    if (count > maxRequests) {
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
