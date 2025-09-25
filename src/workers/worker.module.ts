import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { WorkerAuthContextService } from './worker-auth-context.service';
import { AppointmentsModule } from 'src/modules/appointments/appointments.module';

// módulos que os serviços de agendamento usam (DB/Redis)
import { RedisModule } from 'src/modules/redis/redis.module';
import { DatabaseModule } from 'src/modules/Config/Database/database.module';
import { AuthContextService } from 'src/modules/Auth/auth-context.service';
import { AppointmentsWorkerService } from './appointments-worker.service';

// mapearemos este token para a nossa implementação do worker

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    RedisModule,
    AppointmentsModule,
  ],
  providers: [
    WorkerAuthContextService,
    {
      provide: AuthContextService,
      useExisting: WorkerAuthContextService,
    },
    // O serviço do worker que processa os jobs
    AppointmentsWorkerService,
  ],
  // não precisamos exportar nada, o contexto é apenas deste processo
})
export class WorkerModule {}
