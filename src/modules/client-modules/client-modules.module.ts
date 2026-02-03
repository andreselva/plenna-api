import { Module } from '@nestjs/common';
import { ClientModulesController } from './client-modules.controller';
import { ClientModulesService } from './client-modules.service';
import ClientModulesRepository from './client-modules.repository';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [ClientModulesController],
  providers: [ClientModulesService, ClientModulesRepository]
})
export class ClientModulesModule {}
