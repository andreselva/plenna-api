import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  provider: process.env.EMAIL_PROVIDER,

  // SMTP (fallback/local only)
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE,
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS,
  connectionTimeoutMs: process.env.EMAIL_SMTP_CONNECTION_TIMEOUT_MS,
  socketTimeoutMs: process.env.EMAIL_SMTP_SOCKET_TIMEOUT_MS,
  greetingTimeoutMs: process.env.EMAIL_SMTP_GREETING_TIMEOUT_MS,

  // SES HTTP API
  sesRegion: process.env.EMAIL_SES_REGION ?? process.env.AWS_REGION,
  sesAccessKeyId: process.env.EMAIL_SES_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY_ID,
  sesSecretAccessKey:
    process.env.EMAIL_SES_SECRET_ACCESS_KEY ?? process.env.AWS_SECRET_ACCESS_KEY,
  sesSessionToken: process.env.EMAIL_SES_SESSION_TOKEN ?? process.env.AWS_SESSION_TOKEN,
  sesEndpoint: process.env.EMAIL_SES_ENDPOINT,
  sesConfigurationSet: process.env.EMAIL_SES_CONFIGURATION_SET,

  from: process.env.EMAIL_FROM,

  // Fila
  attempts: process.env.EMAIL_JOB_ATTEMPTS,
  backoffMs: process.env.EMAIL_JOB_BACKOFF_MS,
  concurrency: process.env.EMAIL_WORKER_CONCURRENCY,
  lockDurationMs: process.env.EMAIL_WORKER_LOCK_DURATION_MS,
  lockRenewTimeMs: process.env.EMAIL_WORKER_LOCK_RENEW_TIME_MS,
}));
