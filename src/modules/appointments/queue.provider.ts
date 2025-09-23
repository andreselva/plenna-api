import { Queue as BullQueue, Worker as BullWorker, QueueEvents as BullQueueEvents } from 'bullmq';
import { Queue as FakeQueue, Worker as FakeWorker, QueueEvents as FakeQueueEvents } from '../../vendor/bullmq/fake-bullmq';
import type { Processor } from 'bullmq';
import type { Redis } from 'ioredis';
import { APPOINTMENTS_QUEUE_NAME } from './appointments.constants';

const useFake = String(process.env.USE_FAKE_QUEUE ?? 'false').toLowerCase() === 'true';

const QueueImpl = (useFake ? FakeQueue : BullQueue) as typeof BullQueue;
const WorkerImpl = (useFake ? FakeWorker : BullWorker) as typeof BullWorker;
const QueueEventsImpl = (useFake ? FakeQueueEvents : BullQueueEvents) as typeof BullQueueEvents;

function parseRedisConnection() {
  const url = process.env.REDIS_URL;
  if (url) {
    const u = new URL(url);
    const useTLS = u.protocol === 'rediss:';
    return {
      host: u.hostname,
      port: Number(u.port || 6379),
      username: u.username || undefined,
      password: u.password || undefined,
      tls: useTLS ? {} : undefined,
    };
  }
  return {
    host: process.env.REDIS_HOST || 'redis',
    port: +(process.env.REDIS_PORT || 6379),
    username: process.env.REDIS_USERNAME || undefined,
    password: process.env.REDIS_PASSWORD || undefined,
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
  };
}

export type Queue<Data = any> = BullQueue<Data>;
export type Worker<Data = any> = BullWorker<Data>;

export function createQueue<Data = any>(redis?: Redis) {
  if (useFake) {
    // 👇 cast pra acessar o static get do fake sem o TS implicar
    return (QueueImpl as any).get(APPOINTMENTS_QUEUE_NAME) as Queue<Data>;
  }
  const connection = redis ?? parseRedisConnection();
  return new QueueImpl(APPOINTMENTS_QUEUE_NAME, { connection }) as Queue<Data>;
}

export function createWorker<Data = any>(
  processor: Processor<Data>,
  redis?: Redis,
) {
  if (useFake) {
    return new WorkerImpl(APPOINTMENTS_QUEUE_NAME, processor) as Worker<Data>;
  }
  const connection = redis ?? parseRedisConnection();
  return new WorkerImpl(APPOINTMENTS_QUEUE_NAME, processor, { connection }) as Worker<Data>;
}

export function createQueueEvents(redis?: Redis) {
  if (useFake) return new QueueEventsImpl(APPOINTMENTS_QUEUE_NAME);
  const connection = redis ?? parseRedisConnection();
  return new QueueEventsImpl(APPOINTMENTS_QUEUE_NAME, { connection });
}
