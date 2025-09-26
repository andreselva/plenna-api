import { registerAs } from '@nestjs/config';

const str = (v?: string | null, d?: string) =>
  (typeof v === 'string' ? v.trim() : '') || (d ?? undefined);

const int = (v?: string | number | null, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

const bool = (v?: string | boolean | null, d = false) => {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    if (['1', 'true', 'yes', 'y', 'on'].includes(s)) return true;
    if (['0', 'false', 'no', 'n', 'off'].includes(s)) return false;
  }
  return d;
};

export default registerAs('email', () => {
  const sesRegion = str(process.env.EMAIL_SES_REGION) || str(process.env.AWS_REGION) || 'sa-east-1';

  const sesAccessKeyId = str(process.env.EMAIL_SES_ACCESS_KEY_ID) || str(process.env.AWS_ACCESS_KEY_ID);
  const sesSecretAccessKey =
    str(process.env.EMAIL_SES_SECRET_ACCESS_KEY) || str(process.env.AWS_SECRET_ACCESS_KEY);
  const sesSessionToken = str(process.env.EMAIL_SES_SESSION_TOKEN) || str(process.env.AWS_SESSION_TOKEN);

  // SMTP só pra dev/local
  const smtpPort = int(process.env.EMAIL_PORT, 587);
  const smtpSecure = bool(process.env.EMAIL_SECURE, smtpPort === 465);

  // Fila
  const concurrency = Math.max(1, int(process.env.EMAIL_WORKER_CONCURRENCY, 2));
  const lockDurationMs = Math.max(1_000, int(process.env.EMAIL_WORKER_LOCK_DURATION_MS, 120_000));
  const lockRenewTimeMs = Math.max(5_000, int(process.env.EMAIL_WORKER_LOCK_RENEW_TIME_MS, 30_000));
  const attempts = Math.max(1, int(process.env.EMAIL_JOB_ATTEMPTS, 5));
  const backoffMs = Math.max(0, int(process.env.EMAIL_JOB_BACKOFF_MS, 30_000));

  return {
    provider: str(process.env.EMAIL_PROVIDER, 'ses'),

    // SMTP (fallback/local only)
    host: str(process.env.EMAIL_HOST),
    port: smtpPort,
    secure: smtpSecure,
    user: str(process.env.EMAIL_USER),
    pass: str(process.env.EMAIL_PASS),
    connectionTimeoutMs: int(process.env.EMAIL_SMTP_CONNECTION_TIMEOUT_MS, 10_000),
    socketTimeoutMs: int(process.env.EMAIL_SMTP_SOCKET_TIMEOUT_MS, 20_000),
    greetingTimeoutMs: int(process.env.EMAIL_SMTP_GREETING_TIMEOUT_MS, 10_000),

    // SES API (HTTP)
    sesRegion,
    sesAccessKeyId,
    sesSecretAccessKey,
    sesSessionToken: sesSessionToken || undefined,
    sesConfigurationSet: str(process.env.EMAIL_SES_CONFIGURATION_SET),
    from: str(process.env.EMAIL_FROM) || 'no-reply@plenna.me',

    // Fila (BullMQ)
    attempts,
    backoffMs,
    concurrency,
    lockDurationMs,
    lockRenewTimeMs,
  };
});
