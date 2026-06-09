import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!, { lazyConnect: true, enableOfflineQueue: false });

export async function cacheGet(key: string) {
  try {
    const val = await redis.get(key);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttl = 86400) {
  try {
    const v = JSON.stringify(value);
    if (ttl === 0) await redis.set(key, v);
    else await redis.set(key, v, 'EX', ttl);
  } catch {}
}
