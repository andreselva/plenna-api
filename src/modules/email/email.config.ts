import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  // SMTP
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT ?? '587', 10),
  secure: (process.env.EMAIL_SECURE ?? 'false') === 'true',
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS,
  from: process.env.EMAIL_FROM ?? 'Plenna <no-reply@plenna.app>',

  // Fila
  attempts: parseInt(process.env.EMAIL_JOB_ATTEMPTS ?? '5', 10),
  backoffMs: parseInt(process.env.EMAIL_JOB_BACKOFF_MS ?? '10000', 10), // 10s
  concurrency: parseInt(process.env.EMAIL_WORKER_CONCURRENCY ?? '5', 10),
}));
