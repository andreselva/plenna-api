import { Module } from '@nestjs/common';
import { GatewaysService } from './gateways.service';
import { GatewaysController } from './gateways.controller';

@Module({
  providers: [GatewaysService],
  controllers: [GatewaysController]
})
export class GatewaysModule {}
