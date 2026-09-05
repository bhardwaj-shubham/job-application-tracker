const TOKEN_BUCKET_SCRIPT = `
local key = KEYS[1]

local capacity = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local requested = tonumber(ARGV[3])

-- Use Redis server time so all workers share the same clock.
local redis_time = redis.call("TIME")
local now = (tonumber(redis_time[1]) * 1000) + math.floor(tonumber(redis_time[2]) / 1000)

local bucket = redis.call("HMGET", key, "tokens", "timestamp")

local tokens = tonumber(bucket[1])
local timestamp = tonumber(bucket[2])

-- First request initializes a full bucket.
if tokens == nil then
    tokens = capacity
    timestamp = now
end

local elapsed = math.max(0, now - timestamp)

-- Refill tokens according to elapsed time.
tokens = math.min(
    capacity,
    tokens + (elapsed * refill_rate)
)

local allowed = 0
local retry_after = 0

if tokens >= requested then
    tokens = tokens - requested
    allowed = 1
else
    local missing = requested - tokens

    -- Milliseconds until enough tokens are available.
    retry_after = math.ceil(missing / refill_rate)
end

redis.call(
    "HSET",
    key,
    "tokens", tokens,
    "timestamp", now
)

-- Keep the bucket around long enough for it to refill.
local ttl = math.ceil(capacity / refill_rate) + 60000

redis.call("PEXPIRE", key, ttl)

return {
    allowed,
    tokens,
    retry_after
}
`;

class TokenBucket {
  constructor(redis, { key, capacity, requestsPerMinute }) {
    this.redis = redis;
    this.key = key;
    this.capacity = capacity;

    // Tokens per millisecond.
    this.refillRate = requestsPerMinute / 60_000;
  }

  async acquire(tokens = 1) {
    const result = await this.redis.eval(
      TOKEN_BUCKET_SCRIPT,
      1,
      this.key,
      this.capacity,
      this.refillRate,
      tokens,
    );

    const [allowed, remaining, retryAfter] = result;

    return {
      allowed: Number(allowed) === 1,
      remaining: Number(remaining),
      retryAfterMs: Number(retryAfter),
    };
  }

  async wait(tokens = 1) {
    while (true) {
      const result = await this.acquire(tokens);

      if (result.allowed) {
        return result;
      }

      await new Promise((resolve) => setTimeout(resolve, result.retryAfterMs));
    }
  }
}

export { TokenBucket };
