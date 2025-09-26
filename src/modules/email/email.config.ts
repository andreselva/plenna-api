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

function maskTail(v?: string) {
  const s = (v ?? '').trim();
  if (!s) return ''; // vazio
  return s.length <= 4 ? s : `…${s.slice(-4)}`;
}

function hexEdges(v?: string) {
  const s = (v ?? '').toString();
  const toHex = (t: string) => t.split('').map(c => c.charCodeAt(0).toString(16)).join(' ');
  return { start: toHex(s.slice(0, 2)), end: toHex(s.slice(-2)) };
}

export default registerAs('email', () => {
  // Região (padrão: São Paulo)
  const sesRegion = str(process.env.EMAIL_SES_REGION) || str(process.env.AWS_REGION) || 'sa-east-1';

  // Credenciais IAM (não são as SMTP creds)
  const sesAccessKeyId = str(process.env.EMAIL_SES_ACCESS_KEY_ID) || str(process.env.AWS_ACCESS_KEY_ID);
  const sesSecretAccessKey =
    str(process.env.EMAIL_SES_SECRET_ACCESS_KEY) || str(process.env.AWS_SECRET_ACCESS_KEY);
  const sesSessionToken = str(process.env.EMAIL_SES_SESSION_TOKEN) || str(process.env.AWS_SESSION_TOKEN);

  // SMTP (apenas fallback/dev)
  const smtpPort = int(process.env.EMAIL_PORT, 587);
  const smtpSecure = bool(process.env.EMAIL_SECURE, smtpPort === 465);

  // Fila (BullMQ)
  const concurrency = Math.max(1, int(process.env.EMAIL_WORKER_CONCURRENCY, 2));
  const lockDurationMs = Math.max(1_000, int(process.env.EMAIL_WORKER_LOCK_DURATION_MS, 120_000));
  const lockRenewTimeMs = Math.max(5_000, Math.min(int(process.env.EMAIL_WORKER_LOCK_RENEW_TIME_MS, 30_000), Math.floor(lockDurationMs / 2)));
  const attempts = Math.max(1, int(process.env.EMAIL_JOB_ATTEMPTS, 5));
  const backoffMs = Math.max(0, int(process.env.EMAIL_JOB_BACKOFF_MS, 30_000));

  const from = str(process.env.EMAIL_FROM) || 'no-reply@plenna.me';
  const provider = str(process.env.EMAIL_PROVIDER, 'ses');

  // ===== LOGS DE DIAGNÓSTICO (não expõem segredos) =====
  const akHex = hexEdges(sesAccessKeyId);
  const skHex = hexEdges(sesSecretAccessKey);
  const rgHex = hexEdges(sesRegion);
  // Use console.log aqui porque esse arquivo é carregado antes do Logger do Nest estar pronto
  // Nunca logue o conteúdo completo das chaves
  console.log('[EMAIL-CONFIG]', {
    provider,
    from,
    region: sesRegion,
    regionLen: sesRegion?.length ?? 0,
    regionHexStart: rgHex.start,
    regionHexEnd: rgHex.end,
    accessKeyLen: sesAccessKeyId?.length ?? 0,
    accessKeyTail: maskTail(sesAccessKeyId),
    accessKeyHexStart: akHex.start,
    accessKeyHexEnd: akHex.end,
    secretKeyLen: sesSecretAccessKey?.length ?? 0,
    // só hex das bordas da secret para detectar aspas/CRLF sem expor
    secretKeyHexStart: skHex.start,
    secretKeyHexEnd: skHex.end,
    hasSessionToken: Boolean(sesSessionToken),
    smtp: { host: str(process.env.EMAIL_HOST), port: smtpPort, secure: smtpSecure },
    queue: { concurrency, lockDurationMs, lockRenewTimeMs, attempts, backoffMs },
  });
  // ======================================================

  return {
    provider,

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
    from,

    // Fila (BullMQ)
    attempts,
    backoffMs,
    concurrency,
    lockDurationMs,
    lockRenewTimeMs,
  } as const;
});
