import { Controller, Get } from "@nestjs/common";
import { DashboardServices } from "./DashboardServices";

@Controller('/dashboard')
export class DashboardController {
    constructor(
        private readonly service: DashboardServices
    ) { }

    @Get()
    async getDashboardData() {
        return await this.service.getDashboardData();
    }
}