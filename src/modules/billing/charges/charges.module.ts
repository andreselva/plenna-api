import { Module } from '@nestjs/common';
import { ChargesController } from './charges.controller';
import { ChargesService } from './charges.service';
import { ChargesRepository } from './charges.repository';
import { BillingRulesModule } from '../billing-rules/billing-rules.module';
import { ChargesEngine } from './charges.engine';
import { GatewaysModule } from '../gateways/gateways.module';

@Module({
  controllers: [ChargesController],
  providers: [ChargesService, ChargesRepository, ChargesEngine],
  imports: [BillingRulesModule, GatewaysModule]
})
export class ChargesModule {}
