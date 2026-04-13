import { Controller, Get, HttpCode, HttpStatus, NotFoundException, Post } from '@nestjs/common';
import { LedgerBuildService } from './ledger-build.service';

@Controller('ledger-build')
export class LedgerBuildController {
    constructor(private readonly service: LedgerBuildService) {}

    @Get('latest')
    async getLatest() {
        const build = await this.service.getLatest();
        if (!build) throw new NotFoundException('Nenhum build disponível para este cliente');
        return build;
    }

    @Post('rebuild')
    @HttpCode(HttpStatus.ACCEPTED)
    async scheduleRebuild() {
        await this.service.scheduleRebuild();
        return { scheduled: true };
    }
}
