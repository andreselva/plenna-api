import { Injectable } from "@nestjs/common";
import { RevenueDTO } from "../DTOs/RevenueDTO";
import Revenue from "../Entity/Revenue";
import RevenuesRepository from "../RevenuesRepository";
import { FormatDate } from "src/Shared/Utils/FormatDate";

@Injectable()
export class UpdateRevenue {
    constructor(
        private readonly repository: RevenuesRepository
    ) { }

    async execute(id: string, revenue: RevenueDTO) {
        revenue.id = Number(id);
        revenue.invoiceDueDate = FormatDate.formatToYYYYMMDD(revenue.invoiceDueDate);
        const entity = Revenue.fromDTO(revenue);
        return await this.repository.updateRevenue(entity);
    }
}