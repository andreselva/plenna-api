import { Module } from '@nestjs/common';
import { SaasService } from './saas.service';
import { SaasController } from './saas.controller';
import SaasRepository from './saas.repository';

@Module({
  providers: [SaasService, SaasRepository],
  controllers: [SaasController]
})
export class SaasModule {}
