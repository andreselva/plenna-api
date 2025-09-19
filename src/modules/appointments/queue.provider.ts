import { Queue as BullQueue, Worker as BullWorker, QueueEvents } from 'bullmq';
import { APPOINTMENTS_QUEUE_NAME } from './appointments.constants';

const useFake = String(process.env.USE_FAKE_QUEUE ?? 'false').toLowerCase() === 'true';

let QueueImpl: any;
let WorkerImpl: any;
let QueueEventsImpl: any;

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

if (useFake) {
  const fake = require('../../vendor/bullmq/fake-bullmq');
  QueueImpl = fake.Queue;
  WorkerImpl = fake.Worker;
  QueueEventsImpl = fake.QueueEvents;
} else {
  const real = require('bullmq');
  QueueImpl = real.Queue;
  WorkerImpl = real.Worker;
  QueueEventsImpl = real.QueueEvents;
}

export type Queue<Data = any> = BullQueue<Data>;
export type Worker<Data = any> = BullWorker<Data>;

export function createQueue<Data = any>() {
  if (useFake) {
    // 👇 cast pra acessar o static get do fake sem o TS implicar
    return (QueueImpl as any).get(APPOINTMENTS_QUEUE_NAME) as Queue<Data>;
  }
  return new QueueImpl(APPOINTMENTS_QUEUE_NAME, { connection: parseRedisConnection() }) as Queue<Data>;
}

export function createWorker<Data = any>(processor: import('bullmq').Processor<Data>) {
  if (useFake) {
    return new WorkerImpl(APPOINTMENTS_QUEUE_NAME, processor) as Worker<Data>;
  }
  return new WorkerImpl(APPOINTMENTS_QUEUE_NAME, processor, { connection: parseRedisConnection() }) as Worker<Data>;
}

export function createQueueEvents() {
  if (useFake) return new QueueEventsImpl(APPOINTMENTS_QUEUE_NAME);
  return new QueueEventsImpl(APPOINTMENTS_QUEUE_NAME, { connection: parseRedisConnection() });
}
