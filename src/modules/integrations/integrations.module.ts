import { Module } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import OpenAIService from './openai/openai.service';
import { GatewaysIntegrationsModule } from './gateways/gateways-integrations.module';

@Module({
  providers: [IntegrationsService, OpenAIService],
  controllers: [],
  exports: [OpenAIService, GatewaysIntegrationsModule],
  imports: [GatewaysIntegrationsModule],
})
export class IntegrationsModule {}
