import { Module } from '@nestjs/common';
import { ManagementService } from './management.service';
import { ManagementController } from './management.controller';
import { ClientsModule } from 'src/management/clients/clients.module';
import { UsersModule } from './Users/users.module';

@Module({
  imports: [UsersModule, ClientsModule],
  providers: [ManagementService],
  controllers: [ManagementController],
  exports: [UsersModule, ClientsModule]
})
export class ManagementModule {}
