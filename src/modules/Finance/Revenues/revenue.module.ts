import { Module } from "@nestjs/common";
import RevenuesService from "./RevenuesService";
import RevenuesRepository from "./RevenuesRepository";
import CreateRevenue from "./UseCases/CreateRevenue";
import { DeleteRevenue } from "./UseCases/DeleteRevenue";
import GetRevenues from "./UseCases/GetRevenues";
import { UpdateRevenue } from "./UseCases/UpdateRevenue";
import RevenuesController from "./RevenuesController";
import { FinancialEventsModule } from "../core/financial-events/financial-events.module";

@Module({
    imports: [FinancialEventsModule],
    providers: [RevenuesService, RevenuesRepository, CreateRevenue, DeleteRevenue, GetRevenues, UpdateRevenue],
    controllers: [RevenuesController],
    exports: [RevenuesService]
})

export class RevenueModule { }
