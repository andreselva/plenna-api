import { Module } from '@nestjs/common';
import { GatewaysService } from './gateways.service';
import { GatewaysController } from './gateways.controller';
import { GatewaysRepository } from './gateways.repository';

@Module({
  providers: [
    GatewaysService,
    GatewaysRepository
  ],
  controllers: [GatewaysController],
  exports: [GatewaysService]
})
export class GatewaysModule {}
