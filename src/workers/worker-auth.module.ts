import { Global, Module } from '@nestjs/common';

import { AuthContextService } from 'src/modules/Auth/auth-context.service';
import { WorkerAuthContextService } from './worker-auth-context.service';

@Global()
@Module({
  providers: [
    WorkerAuthContextService,
    {
      provide: AuthContextService,
      useExisting: WorkerAuthContextService,
    },
  ],
  exports: [WorkerAuthContextService, AuthContextService],
})
export class WorkerAuthModule {}
