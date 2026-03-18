import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from 'src/modules/email/email.module';
import { RedisModule } from 'src/modules/redis/redis.module';
import { WorkerAuthModule } from '../worker-auth.module';
import { EmailWorkerService } from './email-worker.service';
import { WorkerFactory } from '../worker.factory';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    WorkerAuthModule,
    EmailModule,
    RedisModule,
  ],
  providers: [EmailWorkerService, WorkerFactory],
})
export class EmailWorkerModule {}