import { Module } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import OpenAIService from './openai/openai.service';

@Module({
  providers: [IntegrationsService, OpenAIService],
  controllers: [],
  exports: [OpenAIService]
})
export class IntegrationsModule {}
