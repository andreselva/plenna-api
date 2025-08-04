import { Module } from "@nestjs/common";
import { HealthCheckController } from "./health-check.controller";

@Module({
    providers: [],
    controllers: [HealthCheckController],
    exports: []

})
export class BankAccountModule { }
