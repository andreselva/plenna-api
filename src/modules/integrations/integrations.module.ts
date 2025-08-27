import { Module } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { IntegrationsController } from './integrations.controller';

@Module({
  providers: [IntegrationsService],
  controllers: [IntegrationsController]
})
export class IntegrationsModule {}
