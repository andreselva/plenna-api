import { Controller, Get, Headers, HttpCode, HttpStatus } from "@nestjs/common";
import { DashboardServices } from "./DashboardServices";
import DashboardArgs from "./Args/DashboardArgs";
import PeriodoDTO from "../DTOs/PeriodoDTO";

@Controller('/dashboard')
export class DashboardController {
    constructor(
        private readonly service: DashboardServices
    ) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    async getDashboardData(
        @Headers('periodo') periodo: string
        // @Req() req -> pra usar dps
    ) {
        // const user = req.user; -> pra usar depois
        const newPeriodo = JSON.parse(periodo) as PeriodoDTO;
        const args = new DashboardArgs(newPeriodo.start, newPeriodo.end);
        return await this.service.getDashboardData(args);
    }
}