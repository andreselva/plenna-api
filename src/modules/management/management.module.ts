import { Module } from '@nestjs/common';
import { ManagementService } from './management.service';
import { ManagementController } from './management.controller';
import { UsersModule } from './Users/users.module';
import { ClientsModule } from './clients/clients.module';

@Module({
  imports: [UsersModule, ClientsModule],
  providers: [ManagementService],
  controllers: [ManagementController],
  exports: [UsersModule, ClientsModule]
})
export class ManagementModule {}
