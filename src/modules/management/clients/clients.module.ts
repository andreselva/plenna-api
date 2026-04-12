import { Module } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import ClientRepository from './clients.repository';
import { AppointmentsModule } from 'src/modules/appointments/appointments.module';

@Module({
  imports: [AppointmentsModule],
  controllers: [ClientsController],
  providers: [ClientsService, ClientRepository],
  exports: [ClientsService]
})
export class ClientsModule {}
