import { Module } from '@nestjs/common';
import { ClientModulesController } from './client-modules.controller';
import { ClientModulesService } from './client-modules.service';

@Module({
  controllers: [ClientModulesController],
  providers: [ClientModulesService]
})
export class ClientModulesModule {}
