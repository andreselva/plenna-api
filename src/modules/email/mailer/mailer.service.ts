import { createHash, createHmac } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import MailComposer from 'nodemailer/lib/mail-composer';

type EmailProvider = 'ses' | 'smtp';

type SendOptions = {
  to: string | string[];
  subject: string;
  html: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: { filename: string; content: any; contentType?: string }[];
};

type SesClientConfig = {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
  endpoint?: string;
};

class SesHttpClient {
  constructor(private readonly config: SesClientConfig) {}

  async sendEmail(payload: Record<string, unknown>): Promise<{ MessageId?: string }> {
    const { region, accessKeyId, secretAccessKey, sessionToken, endpoint } = this.config;
    const service = 'ses';
    const url = new URL(
      '/v2/email/outbound-emails',
      endpoint ?? `https://email.${region}.amazonaws.com`,
    );

    const body = JSON.stringify(payload);
    const contentType = 'application/json';
    const iso = new Date().toISOString();
    const dateStamp = iso.slice(0, 10).replace(/-/g, '');
    const timeStamp = iso.slice(11, 19).replace(/:/g, '');
    const amzDate = `${dateStamp}T${timeStamp}Z`;

    const payloadHash = createHash('sha256').update(body).digest('hex');

    const canonicalHeadersParts = [
      `content-type:${contentType}`,
      `host:${url.host}`,
      `x-amz-content-sha256:${payloadHash}`,
      `x-amz-date:${amzDate}`,
    ];
    const signedHeadersParts = ['content-type', 'host', 'x-amz-content-sha256', 'x-amz-date'];

    if (sessionToken) {
      canonicalHeadersParts.push(`x-amz-security-token:${sessionToken}`);
      signedHeadersParts.push('x-amz-security-token');
    }

    const canonicalRequest = [
      'POST',
      url.pathname,
      '',
      `${canonicalHeadersParts.join('\n')}\n`,
      signedHeadersParts.join(';'),
      payloadHash,
    ].join('\n');

    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      credentialScope,
      createHash('sha256').update(canonicalRequest).digest('hex'),
    ].join('\n');

    const signature = this.signString(stringToSign, dateStamp, region, service, secretAccessKey);

    const headers: Record<string, string> = {
      'content-type': contentType,
      'x-amz-date': amzDate,
      'x-amz-content-sha256': payloadHash,
      Authorization: `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeadersParts.join(';')}, Signature=${signature}`,
    };

    if (sessionToken) {
      headers['x-amz-security-token'] = sessionToken;
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers,
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Falha ao enviar e-mail via SES HTTP: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    return response.json();
  }

  private signString(
    stringToSign: string,
    dateStamp: string,
    region: string,
    service: string,
    secretAccessKey: string,
  ) {
    const kDate = createHmac('sha256', `AWS4${secretAccessKey}`).update(dateStamp).digest();
    const kRegion = createHmac('sha256', kDate).update(region).digest();
    const kService = createHmac('sha256', kRegion).update(service).digest();
    const kSigning = createHmac('sha256', kService).update('aws4_request').digest();
    return createHmac('sha256', kSigning).update(stringToSign).digest('hex');
  }
}

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly provider: EmailProvider;
  private readonly sesClient?: SesHttpClient;
  private transporter?: nodemailer.Transporter;
  private readonly from: string;
  private readonly configurationSet?: string;

  constructor(private readonly config: ConfigService) {
    this.provider = (this.config.get<string>('email.provider') as EmailProvider) ?? 'ses';
    this.from = this.config.get<string>('email.from')!;
    this.configurationSet = this.config.get<string>('email.sesConfigurationSet');

    if (this.provider === 'ses') {
      const region = this.config.get<string>('email.sesRegion') ?? 'us-east-1';
      const accessKeyId = this.config.get<string>('email.sesAccessKeyId');
      const secretAccessKey = this.config.get<string>('email.sesSecretAccessKey');
      const sessionToken = this.config.get<string>('email.sesSessionToken');
      const endpoint = this.config.get<string>('email.sesEndpoint');

      if (!accessKeyId || !secretAccessKey) {
        throw new Error(
          'Credenciais do SES ausentes. Configure EMAIL_SES_ACCESS_KEY_ID e EMAIL_SES_SECRET_ACCESS_KEY.',
        );
      }

      this.sesClient = new SesHttpClient({
        region,
        accessKeyId,
        secretAccessKey,
        sessionToken,
        endpoint,
      });

      const endpointInfo = endpoint ? `, endpoint: ${endpoint}` : '';
      this.logger.log(
        `Transporte de e-mail configurado para SES HTTP (região: ${region}${endpointInfo})`,
      );
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

      this.logger.warn('Utilizando transporte SMTP legado. Considere migrar para SES HTTP em produção.');
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
    if (!value) {
      return undefined;
    }

    return Array.isArray(value) ? value : [value];
  }

  private async sendViaSes(options: SendOptions) {
    if (!this.sesClient) {
      throw new Error('Cliente SES não configurado');
    }

    const toAddresses = this.normalizeAddresses(options.to) ?? [];
    if (!toAddresses.length) {
      throw new Error('Pelo menos um destinatário é obrigatório');
    }

    const ccAddresses = this.normalizeAddresses(options.cc);
    const bccAddresses = this.normalizeAddresses(options.bcc);

    const destination: Record<string, unknown> = {
      ToAddresses: toAddresses,
    };

    if (ccAddresses?.length) {
      destination.CcAddresses = ccAddresses;
    }

    if (bccAddresses?.length) {
      destination.BccAddresses = bccAddresses;
    }

    const payload: Record<string, unknown> = {
      FromEmailAddress: this.from,
      Destination: destination,
    };

    if (this.configurationSet) {
      payload.ConfigurationSetName = this.configurationSet;
    }

    if (options.attachments?.length) {
      const rawMessage = await this.buildRawMessage({
        to: toAddresses,
        subject: options.subject,
        html: options.html,
        cc: ccAddresses,
        bcc: bccAddresses,
        attachments: options.attachments,
      });

      payload.Content = {
        Raw: {
          Data: rawMessage.toString('base64'),
        },
      };
    } else {
      payload.Content = {
        Simple: {
          Subject: {
            Data: options.subject,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: options.html,
              Charset: 'UTF-8',
            },
          },
        },
      };
    }

    const response = await this.sesClient.sendEmail(payload);

    this.logger.log(
      `E-mail enviado para ${JSON.stringify(options.to)} (${response.MessageId ?? 'sem ID'}) via SES HTTP`,
    );

    return response;
  }

  private async buildRawMessage(options: {
    to: string | string[];
    subject: string;
    html: string;
    cc?: string | string[];
    bcc?: string | string[];
    attachments: { filename: string; content: any; contentType?: string }[];
  }) {
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
      composer.compile().build((err, message) => {
        if (err) {
          return reject(err instanceof Error ? err : new Error(String(err)));
        }
        resolve(message as Buffer);
      });
    });

    return buffer;
  }

  private async sendViaSmtp(options: SendOptions) {
    if (!this.transporter) {
      throw new Error('Transporte SMTP não configurado');
    }

    const info = await this.transporter.sendMail({
      from: this.from,
      ...options,
    });
    this.logger.log(`E-mail enviado para ${JSON.stringify(options.to)} (${info.messageId}) via SMTP`);
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
