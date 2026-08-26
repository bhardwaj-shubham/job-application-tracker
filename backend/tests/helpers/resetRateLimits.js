import connection from "../../src/integrations/redis.js";

const resetRateLimits = async () => {
  const keys = await connection.keys("rate-limit:*");

  if (keys.length > 0) {
    await connection.del(keys);
  }
};

export default resetRateLimits;
