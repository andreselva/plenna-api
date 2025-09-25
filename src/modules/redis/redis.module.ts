import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import IORedis, { Redis, RedisOptions } from 'ioredis';

export const REDIS_CONNECTION = 'REDIS_CONNECTION';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CONNECTION,
      inject: [ConfigService],
      useFactory: (cfg: ConfigService): Redis => {
        const commonOpts: Partial<RedisOptions> = {
          maxRetriesPerRequest: null,
          enableReadyCheck: true,
          enableOfflineQueue: true,
          retryStrategy: (times) => Math.min(500 * Math.pow(2, times - 1), 10_000),
          reconnectOnError: (err) => {
            const msg = err?.message ?? '';
            if (
              msg.includes('READONLY') ||
              msg.includes('ETIMEDOUT') ||
              msg.includes('EHOSTUNREACH')
            )
              return true;
            return false;
          },
          lazyConnect: false,
        };

        const url = cfg.get<string>('REDIS_URL');
        if (url) {
          return new IORedis(url, {
            family: 0,
            ...commonOpts,
          });
        }

        const host = cfg.get<string>('REDIS_HOST', 'redis');
        const port = cfg.get<number>('REDIS_PORT', 6379);
        const password = cfg.get<string>('REDIS_PASSWORD');
        const username = cfg.get<string>('REDIS_USERNAME');
        const db = cfg.get<number>('REDIS_DB', 0);
        const tls = cfg.get<boolean>('REDIS_TLS') ? {} : undefined;

        return new IORedis(
          {
            host,
            port,
            password,
            username,
            db,
            tls,
            family: 0,
            ...commonOpts,
          },
        );
      },
    },
  ],
  exports: [REDIS_CONNECTION],
})
export class RedisModule {}
