import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { LedgerBuildService } from './ledger-build.service';

@Controller('ledger-build')
export class LedgerBuildController {
    constructor(private readonly service: LedgerBuildService) {}

    @Post('rebuild')
    @HttpCode(HttpStatus.ACCEPTED)
    async scheduleRebuild() {
        await this.service.scheduleRebuild();
        return { scheduled: true };
    }
}
