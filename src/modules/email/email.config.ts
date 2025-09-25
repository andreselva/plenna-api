import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  provider: process.env.EMAIL_PROVIDER ?? 'ses',

  // SMTP (fallback/local only)
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT ?? '587', 10),
  secure: (process.env.EMAIL_SECURE ?? 'false') === 'true',
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS,
  connectionTimeoutMs: parseInt(process.env.EMAIL_SMTP_CONNECTION_TIMEOUT_MS ?? '10000', 10),
  socketTimeoutMs: parseInt(process.env.EMAIL_SMTP_SOCKET_TIMEOUT_MS ?? '20000', 10),
  greetingTimeoutMs: parseInt(process.env.EMAIL_SMTP_GREETING_TIMEOUT_MS ?? '10000', 10),

  // SES HTTP API
  sesRegion: process.env.EMAIL_SES_REGION ?? process.env.AWS_REGION ?? 'us-east-1',
  sesAccessKeyId: process.env.EMAIL_SES_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY_ID,
  sesSecretAccessKey:
    process.env.EMAIL_SES_SECRET_ACCESS_KEY ?? process.env.AWS_SECRET_ACCESS_KEY,
  sesSessionToken: process.env.EMAIL_SES_SESSION_TOKEN ?? process.env.AWS_SESSION_TOKEN,
  sesEndpoint: process.env.EMAIL_SES_ENDPOINT,
  sesConfigurationSet: process.env.EMAIL_SES_CONFIGURATION_SET,

  from: process.env.EMAIL_FROM ?? 'Plenna <no-reply@plenna.app>',
  connectionTimeoutMs: parseInt(process.env.EMAIL_SMTP_CONNECTION_TIMEOUT_MS ?? '10000', 10),
  socketTimeoutMs: parseInt(process.env.EMAIL_SMTP_SOCKET_TIMEOUT_MS ?? '20000', 10),
  greetingTimeoutMs: parseInt(process.env.EMAIL_SMTP_GREETING_TIMEOUT_MS ?? '10000', 10),

  // Fila
  attempts: parseInt(process.env.EMAIL_JOB_ATTEMPTS ?? '5', 10),
  backoffMs: parseInt(process.env.EMAIL_JOB_BACKOFF_MS ?? '10000', 10), // 10s
  concurrency: parseInt(process.env.EMAIL_WORKER_CONCURRENCY ?? '5', 10),
  lockDurationMs: parseInt(process.env.EMAIL_WORKER_LOCK_DURATION_MS ?? '120000', 10),
  lockRenewTimeMs: parseInt(process.env.EMAIL_WORKER_LOCK_RENEW_TIME_MS ?? '30000', 10),
}));
