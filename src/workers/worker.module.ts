import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppointmentsModule } from 'src/modules/appointments/appointments.module';
import { EmailModule } from 'src/modules/email/email.module';

// módulos que os serviços de agendamento usam (DB/Redis)
import { RedisModule } from 'src/modules/redis/redis.module';
import { DatabaseModule } from 'src/modules/Config/Database/database.module';

import { AppointmentsWorkerService } from './appointments-worker.service';
import { EmailWorkerService } from './email-worker.service';
import { WorkerAuthModule } from './worker-auth.module';

// mapearemos este token para a nossa implementação do worker

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    WorkerAuthModule,
    DatabaseModule,
    RedisModule,
    AppointmentsModule,
    EmailModule,
  ],
  providers: [
    // Serviços responsáveis por processar os jobs das filas
    AppointmentsWorkerService,
    EmailWorkerService,
  ],
  // não precisamos exportar nada, o contexto é apenas deste processo
})
export class WorkerModule {}
