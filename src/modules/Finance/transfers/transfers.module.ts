import { Module } from '@nestjs/common';
import { TransfersController } from './transfers.controller';
import { TransfersService } from './transfers.service';
import { TransfersRepository } from './transfers.repository';
import { FinancialEventsModule } from '../core/financial-events/financial-events.module';

@Module({
    imports: [FinancialEventsModule],
    controllers: [TransfersController],
    providers: [TransfersService, TransfersRepository],
    exports: [],
})
export class TransfersModule {}
