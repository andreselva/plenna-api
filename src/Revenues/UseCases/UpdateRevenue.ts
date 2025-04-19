import { Injectable } from "@nestjs/common";
import { RevenueDTO } from "../DTOs/RevenueDTO";
import Revenue from "../Entity/Revenue";
import RevenuesRepository from "../RevenuesRepository";

@Injectable()
export class UpdateRevenue {
    constructor(
        private readonly repository: RevenuesRepository
    ) { }

    async execute(id: string, revenue: RevenueDTO) {
        revenue.id = Number(id);
        const entity = Revenue.fromDTO(revenue);
        return await this.repository.updateRevenue(entity);
    }
}