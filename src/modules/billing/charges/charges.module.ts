import { Module } from '@nestjs/common';
import { ChargesController } from './charges.controller';
import { ChargesService } from './charges.service';
import { ChargesRepository } from './charges.repository';

@Module({
  controllers: [ChargesController],
  providers: [ChargesService, ChargesRepository]
})
export class ChargesModule {}
