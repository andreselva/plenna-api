import { Module } from '@nestjs/common';
import { ChargesController } from './charges.controller';
import { ChargesService } from './charges.service';
import { ChargesRepository } from './charges.repository';
import { BillingRulesModule } from '../billing-rules/billing-rules.module';
import { ChargesEngine } from './charges.engine';
import { IntegrationsModule } from 'src/modules/integrations/integrations.module';

@Module({
  controllers: [ChargesController],
  providers: [ChargesService, ChargesRepository, ChargesEngine],
  imports: [BillingRulesModule, IntegrationsModule]
})
export class ChargesModule {}
