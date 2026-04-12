import { Module } from '@nestjs/common';
import { TransfersController } from './transfers.controller';
import { TransfersService } from './transfers.service';
import { TransfersRepository } from './transfers.repository';

@Module({
    imports: [],
    controllers: [TransfersController],
    providers: [TransfersService, TransfersRepository],
    exports: [],
})
export class TransfersModule {}
