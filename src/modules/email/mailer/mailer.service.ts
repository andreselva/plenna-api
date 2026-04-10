import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import MailComposer from 'nodemailer/lib/mail-composer';

import {
  SESv2Client,
  SendEmailCommand,
  SendEmailCommandInput,
} from '@aws-sdk/client-sesv2';

type EmailProvider = 'ses' | 'smtp';

type SendOptions = {
  to: string | string[];
  subject: string;
  html: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: { filename: string; content: any; contentType?: string }[];
};

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly provider: EmailProvider;
  private transporter?: nodemailer.Transporter;
  private readonly from: string;
  private readonly configurationSet?: string;
  private readonly ses?: SESv2Client;
  private readonly forceRaw: boolean;

  constructor(private readonly config: ConfigService) {
    this.provider = (this.config.get<string>('email.provider') as EmailProvider) ?? 'ses';
    this.from = this.config.get<string>('email.from')!;
    this.configurationSet = this.config.get<string>('email.sesConfigurationSet');

    // pode vir direto do env
    const envForceRaw = process.env.EMAIL_SES_FORCE_RAW ?? this.config.get<string>('EMAIL_SES_FORCE_RAW');
    this.forceRaw = (envForceRaw ?? 'false').toLowerCase() === 'true';

    if (this.provider === 'ses' && process.env.NODE_ENV !== 'development') {
      const region = this.config.get<string>('email.sesRegion') ?? 'us-east-1';
      const accessKeyId = this.config.get<string>('email.sesAccessKeyId');
      const secretAccessKey = this.config.get<string>('email.sesSecretAccessKey');
      const sessionToken = this.config.get<string>('email.sesSessionToken');

      if (!accessKeyId || !secretAccessKey) {
        throw new Error(
          'Credenciais do SES ausentes. Configure EMAIL_SES_ACCESS_KEY_ID e EMAIL_SES_SECRET_ACCESS_KEY.',
        );
      }

      this.ses = new SESv2Client({
        region,
        credentials: { accessKeyId, secretAccessKey, sessionToken },
      });

    } else {
      const connectionTimeout = this.config.get<number>('email.connectionTimeoutMs') ?? 10000;
      const socketTimeout = this.config.get<number>('email.socketTimeoutMs') ?? 20000;
      const greetingTimeout = this.config.get<number>('email.greetingTimeoutMs') ?? 10000;

      this.transporter = nodemailer.createTransport({
        host: this.config.get<string>('email.host'),
        port: this.config.get<number>('email.port'),
        secure: this.config.get<boolean>('email.secure'),
        auth: {
          user: this.config.get<string>('email.user'),
          pass: this.config.get<string>('email.pass'),
        },
        pool: true,
        connectionTimeout,
        socketTimeout,
        greetingTimeout,
      });

      this.logger.warn('Utilizando transporte SMTP legado.');
    }

    this.registerDefaultHelpers();
  }

  private registerDefaultHelpers() {
    Handlebars.registerHelper('currencyBRL', (v: any) =>
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v)),
    );
  }

  async sendRaw(options: SendOptions) {
    if (this.provider === 'ses') {
      return this.sendViaSes(options);
    }
    return this.sendViaSmtp(options);
  }

  private normalizeAddresses(value?: string | string[]): string[] | undefined {
    if (!value) return undefined;
    return Array.isArray(value) ? value : [value];
  }

  private async sendViaSes(options: SendOptions) {
    if (!this.ses) throw new Error('SES client não configurado');

    const to = this.normalizeAddresses(options.to) ?? [];
    if (!to.length) throw new Error('Pelo menos um destinatário é obrigatório');

    const cc = this.normalizeAddresses(options.cc);
    const bcc = this.normalizeAddresses(options.bcc);

    const fromHasDisplayName = this.from.includes('<') && this.from.includes('>');
    const fromEmailOnly = this.from.match(/<(.+?)>/)?.[1] ?? this.from;

    const useRaw = !!(options.attachments?.length || fromHasDisplayName || this.forceRaw);

    let input: SendEmailCommandInput;

    if (useRaw) {
      const rawBuffer = await this.buildRawMessage({
        to,
        subject: options.subject,
        html: options.html,
        cc,
        bcc,
        attachments: options.attachments ?? [],
      });

      input = {
        FromEmailAddress: fromEmailOnly,
        Destination: { ToAddresses: to, CcAddresses: cc, BccAddresses: bcc },
        Content: { Raw: { Data: rawBuffer } },
        ConfigurationSetName: this.configurationSet,
      };

    } else {
      input = {
        FromEmailAddress: fromEmailOnly,
        Destination: { ToAddresses: to, CcAddresses: cc, BccAddresses: bcc },
        Content: {
          Simple: {
            Subject: { Data: options.subject, Charset: 'UTF-8' },
            Body: { Html: { Data: options.html, Charset: 'UTF-8' } },
          },
        },
        ConfigurationSetName: this.configurationSet,
      };

    }

    const res = await this.ses.send(new SendEmailCommand(input));
    return res;
  }

  private async buildRawMessage(options: {
    to: string[];
    subject: string;
    html: string;
    cc?: string[];
    bcc?: string[];
    attachments: { filename: string; content: any; contentType?: string }[];
  }): Promise<Buffer> {
    const composer = new MailComposer({
      from: this.from,
      to: options.to,
      cc: options.cc,
      bcc: options.bcc,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments,
    });

    const buffer = await new Promise<Buffer>((resolve, reject) => {
      composer.compile().build((err: unknown, message: unknown) => {
        if (err) {
          return reject(
            err instanceof Error
              ? err
              : new Error(JSON.stringify(err))
          );
        }
        resolve(message as Buffer);
      });
    });

    return buffer;
  }

  private async sendViaSmtp(options: SendOptions) {
    if (!this.transporter) throw new Error('Transporte SMTP não configurado');

    const info = await this.transporter.sendMail({
      from: this.from,
      ...options,
    });

    return info;
  }

  compileTemplate(templateName: string, context: Record<string, any>): string {
    const filePath = path.join(__dirname, 'templates', `${templateName}.hbs`);
    const source = fs.readFileSync(filePath, 'utf8');
    const compiled = Handlebars.compile(source);
    return compiled(context);
  }

  async sendTemplate(options: {
    to: string | string[];
    subject: string;
    template: string;
    context: Record<string, any>;
    cc?: string | string[];
    bcc?: string | string[];
    attachments?: { filename: string; content: any; contentType?: string }[];
  }) {
    const html = this.compileTemplate(options.template, options.context);
    return this.sendRaw({ ...options, html });
  }
}
