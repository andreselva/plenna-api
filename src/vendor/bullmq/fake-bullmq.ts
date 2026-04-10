import { DateTime } from 'luxon';

/* eslint-disable @typescript-eslint/require-await */

type Milliseconds = number;

type RepeatInterval = {
  timer: NodeJS.Timeout;
  type: 'interval' | 'timeout';
};

export interface ConnectionOptions {
  host?: string;
  port?: number;
  username?: string;
  password?: string;
}

export interface RepeatOptions {
  every?: Milliseconds;
  pattern?: string;
  tz?: string;
}

export interface JobsOptions {
  jobId?: string;
  repeat?: RepeatOptions;
  removeOnComplete?: boolean | number;
}

export interface Job<DataType = any, NameType extends string = string> {
  id: string;
  name: NameType;
  data: DataType;
  opts?: JobsOptions;
}

export type Processor<DataType = any> = (job: Job<DataType>) => Promise<void> | void;

interface RepeatableJob<DataType = any> {
  job: Job<DataType>;
  repeat: RepeatOptions;
  controller: RepeatInterval;
  next?: Date;
}

const queues = new Map<string, Queue<any, any>>();

function safeNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function parseNumber(value: string | undefined, fallback = 0): number {
  if (value == null) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function cronDaysToLuxonDays(expression: string | undefined): Set<number> | null {
  if (!expression || expression === '*') {
    return null;
  }

  const values = new Set<number>();

  for (const part of expression.split(',')) {
    if (!part) continue;

    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = parseNumber(startStr, NaN);
      const end = parseNumber(endStr, NaN);

      if (Number.isNaN(start) || Number.isNaN(end)) continue;

      for (let i = start; i <= end; i += 1) {
        const normalized = i === 0 ? 7 : i;
        values.add(normalized);
      }
    } else {
      const parsed = parseNumber(part, NaN);
      const normalized = parsed === 0 ? 7 : parsed;

      if (!Number.isNaN(normalized)) {
        values.add(normalized);
      }
    }
  }

  return values;
}

function computeNextCron(pattern: string, tz: string, from: DateTime): DateTime {
  void tz;

  const [minuteExp, hourExp, , , dayOfWeekExp] = pattern.split(' ', 5);

  const minute = parseNumber(minuteExp, 0);
  const hour = hourExp === '*' ? null : parseNumber(hourExp, 0);
  const allowedDays = cronDaysToLuxonDays(dayOfWeekExp);

  if (hour === null) {
    return from.plus({ hours: 1 }).set({
      minute,
      second: 0,
      millisecond: 0,
    });
  }

  const safeHour: number = hour;

  let candidate = from.set({ second: 0, millisecond: 0 });

  if (candidate.minute > minute || (candidate.minute === minute && candidate.hour >= safeHour)) {
    candidate = candidate.plus({ days: 1 });
  }

  candidate = candidate.set({ hour: safeHour, minute, second: 0, millisecond: 0 });

  if (!allowedDays || allowedDays.size === 0) {
    return candidate;
  }

  while (!allowedDays.has(safeNumber(candidate.weekday, 0))) {
    candidate = candidate.plus({ days: 1 }).set({
      hour: safeHour,
      minute,
      second: 0,
      millisecond: 0,
    });
  }

  return candidate;
}

export class Queue<DataType = any, NameType extends string = string> {
  public readonly name: string;

  private readonly repeatableJobs = new Map<string, RepeatableJob<DataType>>();
  private readonly workers = new Set<Worker<DataType, NameType>>();

  private constructor(name: string) {
    this.name = name;
  }

  static get<DataType = any, NameType extends string = string>(name: string): Queue<DataType, NameType> {
    const existing = queues.get(name);
    if (existing) {
      return existing as Queue<DataType, NameType>;
    }

    const queue = new Queue<DataType, NameType>(name);
    queues.set(name, queue);
    return queue;
  }

  async add(name: NameType, data: DataType, opts: JobsOptions = {}): Promise<Job<DataType>> {
    const jobId = opts.jobId ?? `${name}:${Date.now()}`;
    const job: Job<DataType> = { id: jobId, name, data, opts };

    const existing = this.repeatableJobs.get(jobId);
    if (existing) {
      this.clearInterval(existing);
      this.repeatableJobs.delete(jobId);
    }

    if (opts.repeat?.every) {
      const every = safeNumber(opts.repeat.every, 0);

      if (every <= 0) {
        throw new Error('Repeat interval must be greater than zero.');
      }

      const controller: RepeatInterval = {
        type: 'interval',
        timer: setInterval(() => {
          void this.dispatch(job);
        }, every),
      };

      this.repeatableJobs.set(jobId, {
        job,
        repeat: opts.repeat,
        controller,
        next: new Date(safeNumber(Date.now() + every, Date.now())),
      });

      void this.dispatch(job);
    } else if (opts.repeat?.pattern) {
      const tz = opts.repeat.tz ?? 'UTC';

      const scheduleNext = () => {
        const now = DateTime.now().setZone(tz);
        const next = computeNextCron(opts.repeat!.pattern!, tz, now);

        const diff = next.diff(now, 'milliseconds');
        const rawMilliseconds: unknown = diff.milliseconds;
        const diffMs = typeof rawMilliseconds === 'number' ? rawMilliseconds : 0;
        const delay = Math.max(Math.floor(diffMs), 0);

        const controller: RepeatInterval = {
          type: 'timeout',
          timer: setTimeout(() => {
            this.repeatableJobs.set(jobId, {
              job,
              repeat: opts.repeat!,
              controller,
              next: next.toJSDate(),
            });

            void this.dispatch(job).finally(scheduleNext);
          }, delay),
        };

        this.repeatableJobs.set(jobId, {
          job,
          repeat: opts.repeat!,
          controller,
          next: next.toJSDate(),
        });
      };

      scheduleNext();
    } else {
      setTimeout(() => {
        void this.dispatch(job);
      }, 0);
    }

    return job;
  }

  async remove(jobId: string): Promise<void> {
    const existing = this.repeatableJobs.get(jobId);
    if (existing) {
      this.clearInterval(existing);
      this.repeatableJobs.delete(jobId);
    }
  }

  async removeRepeatable(name: string, repeat: RepeatOptions, jobId?: string): Promise<void> {
    if (!jobId) {
      return;
    }

    const existing = this.repeatableJobs.get(jobId);
    if (existing && existing.job.name === name) {
      if (repeat.pattern === existing.repeat.pattern || repeat.every === existing.repeat.every) {
        this.clearInterval(existing);
        this.repeatableJobs.delete(jobId);
      }
    }
  }

  async removeRepeatableByKey(key: string): Promise<void> {
    const existing = this.repeatableJobs.get(key);
    if (existing) {
      this.clearInterval(existing);
      this.repeatableJobs.delete(key);
    }
  }

  async removeJobScheduler(key: string): Promise<void> {
    await this.removeRepeatableByKey(key);
  }

  async getRepeatableJobs(): Promise<Array<{ id: string; key: string; name: string; next: number | null }>> {
    return Array.from(this.repeatableJobs.values()).map(({ job, next }) => ({
      id: job.id,
      key: job.id,
      name: job.name,
      next: next ? safeNumber(next.getTime(), 0) : null,
    }));
  }

  async getJobSchedulers(): Promise<Array<{ id: string; key: string; name: string; next: number | null }>> {
    return this.getRepeatableJobs();
  }

  registerWorker(worker: Worker<DataType, NameType>) {
    this.workers.add(worker);
  }

  unregisterWorker(worker: Worker<DataType, NameType>) {
    this.workers.delete(worker);
  }

  private async dispatch(job: Job<DataType>) {
    for (const worker of this.workers) {
      await worker.execute(job);
    }
  }

  private clearInterval(repeatable: RepeatableJob<DataType>) {
    if (repeatable.controller.type === 'interval') {
      clearInterval(repeatable.controller.timer);
    } else {
      clearTimeout(repeatable.controller.timer);
    }
  }
}

export class QueueEvents {
  constructor(public readonly name: string) {}

  async close() {
    return;
  }
}

export class Worker<DataType = any, NameType extends string = string> {
  private readonly queue: Queue<DataType, NameType>;

  constructor(name: string, private readonly processor: Processor<DataType>) {
    this.queue = Queue.get<DataType, NameType>(name);
    this.queue.registerWorker(this);
  }

  async execute(job: Job<DataType>) {
    try {
      await this.processor(job);
    } catch (error) {
      console.error(`Worker for queue "${this.queue.name}" failed:`, error);
    }
  }

  async close(): Promise<void> {
    this.queue.unregisterWorker(this);
  }
}

export class QueueScheduler {
  constructor(public readonly name: string, _options?: unknown) {
    void _options;
  }

  async waitUntilReady() {
    return;
  }

  async close() {
    return;
  }
}