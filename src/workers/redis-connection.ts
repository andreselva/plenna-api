import type { ConnectionOptions } from 'bullmq';

export function createRedisConnectionOptions(): ConnectionOptions {
  const url = process.env.REDIS_URL;
  if (url) {
    const parsed = new URL(url);
    const useTLS = parsed.protocol === 'rediss:';

    return {
      family: 0,
      host: parsed.hostname,
      port: Number(parsed.port || 6379),
      username: parsed.username || undefined,
      password: parsed.password || undefined,
      tls: useTLS ? {} : undefined,
    } as ConnectionOptions;
  }

  return {
    family: 0,
    host: process.env.REDIS_HOST || 'redis',
    port: Number(process.env.REDIS_PORT || 6379),
    username: process.env.REDIS_USERNAME || undefined,
    password: process.env.REDIS_PASSWORD || undefined,
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
  } as ConnectionOptions;
}
