import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { WorkerAuthModule } from './worker-auth.module';
import { EmailModule } from 'src/modules/email/email.module';
import { EmailWorkerService } from './email-worker.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    WorkerAuthModule,
    EmailModule,
  ],
  providers: [EmailWorkerService],
})
export class EmailWorkerModule {}
