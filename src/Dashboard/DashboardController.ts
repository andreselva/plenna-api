import { Controller, Get, Headers, UseGuards } from "@nestjs/common";
import { DashboardServices } from "./DashboardServices";
import DashboardArgs from "./Args/DashboardArgs";
import PeriodoDTO from "./DTOs/PeriodoDTO";
import { AuthGuard } from "@nestjs/passport";

@Controller('/dashboard')
export class DashboardController {
    constructor(
        private readonly service: DashboardServices
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async getDashboardData(
        @Headers('periodo') periodo: string,
    ) {
        const newPeriodo = JSON.parse(periodo) as PeriodoDTO;
        const args = new DashboardArgs(newPeriodo.start, newPeriodo.end);
        return await this.service.getDashboardData(args);
    }
}