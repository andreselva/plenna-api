import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import emailConfig from './email.config';
import { emailQueueProviders } from './queue/email.queue.provider';
import { EmailService } from './email.service';
import { MailerService } from './mailer/mailer.service';
import { EmailProcessor } from './email.processor';
import { EmailQueueHealth } from './queue/email.queue.health';
import { EmailController } from './email.controller';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [ConfigModule.forFeature(emailConfig), RedisModule],
  providers: [
    ...emailQueueProviders,
    MailerService,
    EmailService,
    EmailProcessor,
    EmailQueueHealth,
  ],
  controllers: [EmailController],
  exports: [EmailService],
})
export class EmailModule {}
