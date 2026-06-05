import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// BullMQ requires its own ioredis instance; we provide connection options as a URL string
// so BullMQ can create its internal instance without type conflicts.
export function getRedisConnectionOptions(): { url: string } {
  return { url: REDIS_URL };
}

// Separate Redis client for general app use (job state cache, etc.)
let appRedisClient: Redis | null = null;

export function getAppRedis(): Redis {
  if (!appRedisClient) {
    appRedisClient = new Redis(REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
    });

    appRedisClient.on('error', (err) => {
      console.error('[Redis] Connection error:', err.message);
    });

    appRedisClient.on('connect', () => {
      console.log('[Redis] App client connected');
    });
  }
  return appRedisClient;
}

export async function setJobState(jobId: string, state: object, ttlSeconds = 3600): Promise<void> {
  try {
    const redis = getAppRedis();
    await redis.set(`job:${jobId}`, JSON.stringify(state), 'EX', ttlSeconds);
  } catch (err) {
    console.error('[Redis] setJobState failed:', err);
  }
}

export async function getJobState(jobId: string): Promise<object | null> {
  try {
    const redis = getAppRedis();
    const data = await redis.get(`job:${jobId}`);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('[Redis] getJobState failed:', err);
    return null;
  }
}
