import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { LedgerMonthlyBuildService } from './ledger-monthly-build.service';

@Controller('ledger-build/monthly')
export class LedgerMonthlyBuildController {
    constructor(private readonly service: LedgerMonthlyBuildService) {}

    @Get()
    async list() {
        return this.service.listPeriods(12);
    }

    @Get(':period')
    async getByPeriod(@Param('period') period: string) {
        const build = await this.service.getByPeriod(period);
        if (!build) throw new NotFoundException(`Nenhum build disponível para o período ${period}`);
        return build;
    }
}
