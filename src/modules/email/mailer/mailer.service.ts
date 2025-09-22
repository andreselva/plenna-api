import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('email.host'),
      port: this.config.get<number>('email.port'),
      secure: this.config.get<boolean>('email.secure'),
      auth: {
        user: this.config.get<string>('email.user'),
        pass: this.config.get<string>('email.pass'),
      },
    });

    this.from = this.config.get<string>('email.from')!;
    this.registerDefaultHelpers();
  }

  private registerDefaultHelpers() {
    Handlebars.registerHelper('currencyBRL', (v: any) =>
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v)),
    );
  }

  async sendRaw(options: {
    to: string | string[];
    subject: string;
    html: string;
    cc?: string | string[];
    bcc?: string | string[];
    attachments?: { filename: string; content: any; contentType?: string }[];
  }) {
    const info = await this.transporter.sendMail({
      from: this.from,
      ...options,
    });
    this.logger.log(`E-mail enviado para ${JSON.stringify(options.to)} (${info.messageId})`);
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
