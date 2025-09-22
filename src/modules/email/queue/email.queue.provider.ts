import { Provider, Inject } from '@nestjs/common';
import { Queue, QueueEvents } from 'bullmq';
import { EMAIL_EVENTS_TOKEN, EMAIL_QUEUE_NAME, EMAIL_QUEUE_TOKEN } from '../email.constants';
import { REDIS_CONNECTION } from 'src/modules/redis/redis.module';
import type { Redis } from 'ioredis';

export const emailQueueProviders: Provider[] = [
  {
    provide: EMAIL_QUEUE_TOKEN,
    inject: [REDIS_CONNECTION],
    useFactory: (redis: Redis) => {
      return new Queue(EMAIL_QUEUE_NAME, { connection: redis });
    },
  },
  {
    provide: EMAIL_EVENTS_TOKEN,
    inject: [REDIS_CONNECTION],
    useFactory: (redis: Redis) => {
      return new QueueEvents(EMAIL_QUEUE_NAME, { connection: redis });
    },
  },
];
