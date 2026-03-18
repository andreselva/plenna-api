import {
  Queue as BullQueue,
  QueueEvents as BullQueueEvents,
} from 'bullmq';
import {
  Queue as FakeQueue,
  QueueEvents as FakeQueueEvents,
} from '../../vendor/bullmq/fake-bullmq';
import type { Redis } from 'ioredis';
import { APPOINTMENTS_QUEUE_NAME } from './appointments.constants';

const useFake = String(process.env.USE_FAKE_QUEUE ?? 'false').toLowerCase() === 'true';

const QueueImpl = (useFake ? FakeQueue : BullQueue) as typeof BullQueue;
const QueueEventsImpl = (useFake ? FakeQueueEvents : BullQueueEvents) as typeof BullQueueEvents;

export type Queue<Data = any> = BullQueue<Data>;

export function createQueue<Data = any>(redis: Redis): Queue<Data> {
  if (useFake) {
    return (QueueImpl as any).get(APPOINTMENTS_QUEUE_NAME) as Queue<Data>;
  }
  return new QueueImpl(APPOINTMENTS_QUEUE_NAME, { connection: redis }) as Queue<Data>;
}

export function createQueueEvents(redis: Redis) {
  if (useFake) return new QueueEventsImpl(APPOINTMENTS_QUEUE_NAME);
  return new QueueEventsImpl(APPOINTMENTS_QUEUE_NAME, { connection: redis });
}