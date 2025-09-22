export interface SendMailPayload {
  to: string | string[];
  subject: string;
  html: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: { filename: string; content: Buffer | string; contentType?: string }[];
}

export interface SendTemplatePayload {
  to: string | string[];
  subject: string;
  template: string;
  context: Record<string, any>;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: { filename: string; content: Buffer | string; contentType?: string }[];
}
