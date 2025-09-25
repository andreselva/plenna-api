export const EMAIL_QUEUE_NAME = 'email-queue';

export const EMAIL_JOB = {
  SEND_MAIL: 'send-mail',
  SEND_TEMPLATE: 'send-template',
} as const;

export type EmailJobName = typeof EMAIL_JOB[keyof typeof EMAIL_JOB];

export const EMAIL_QUEUE_TOKEN = 'EMAIL_QUEUE_TOKEN';
export const EMAIL_EVENTS_TOKEN = 'EMAIL_EVENTS_TOKEN';

export const EMAIL_LOGGER_CTX = 'Email';
