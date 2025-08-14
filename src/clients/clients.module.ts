import { Module } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { UsersModule } from './Users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [ClientsController],
  providers: [ClientsService]
})

export class ClientsModule {}
