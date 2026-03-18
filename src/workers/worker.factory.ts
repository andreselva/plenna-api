import { Injectable, Inject } from '@nestjs/common';
import { Worker, type Processor } from 'bullmq';
import type { Redis } from 'ioredis';
import { REDIS_CONNECTION } from 'src/modules/redis/redis.tokens';

export interface WorkerOptions {
  concurrency?: number;
  lockDuration?: number;
  lockRenewTime?: number;
}

@Injectable()
export class WorkerFactory {
  constructor(@Inject(REDIS_CONNECTION) private readonly redis: Redis) {}

  create<Data = any>(
    queueName: string,
    processor: Processor<Data>,
    options: WorkerOptions = {},
  ): Worker<Data> {
    return new Worker<Data>(queueName, processor, {
      connection: this.redis,
      ...options,
    });
  }
}