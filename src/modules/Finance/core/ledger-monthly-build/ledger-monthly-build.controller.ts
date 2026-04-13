import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { LedgerMonthlyBuildService } from './ledger-monthly-build.service';

@Controller('ledger-monthly-build')
export class LedgerMonthlyBuildController {
    constructor(private readonly service: LedgerMonthlyBuildService) {}

    @Post('rebuild')
    @HttpCode(HttpStatus.ACCEPTED)
    async scheduleRebuild() {
        await this.service.scheduleRebuild();
        return { scheduled: true };
    }
}
