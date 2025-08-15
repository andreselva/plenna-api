import { Module } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import ClientRepository from './clients.repository';

@Module({
  imports: [],
  controllers: [ClientsController],
  providers: [ClientsService, ClientRepository],
  exports: [ClientsService]
})

export class ClientsModule {}
