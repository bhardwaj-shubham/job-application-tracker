import { Redis } from "ioredis";
import env from "../config/env.js";

const redisOptions = {
  maxRetriesPerRequest: null,
};

const connection = env?.REDIS_URL
  ? new Redis(env.REDIS_URL, redisOptions)
  : new Redis({
      host: env.REDIS_HOST || "localhost",
      port: Number(env.REDIS_PORT || 6379),
      password: env.REDIS_PASSWORD,
      ...redisOptions,
    });

export default connection;
