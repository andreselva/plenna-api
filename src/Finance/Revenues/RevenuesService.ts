import { Dependencies, Injectable } from "@nestjs/common";
import CreateRevenue from "./UseCases/CreateRevenue";
import GetRevenues from "./UseCases/GetRevenues";
import { RevenueDTO } from "./DTOs/RevenueDTO";
import { DeleteRevenue } from "./UseCases/DeleteRevenue";
import { UpdateRevenue } from "./UseCases/UpdateRevenue";

@Injectable()
@Dependencies(
    GetRevenues,
    CreateRevenue,
    DeleteRevenue,
    UpdateRevenue,
)
export default class RevenuesService {
    constructor(
        private readonly getRevenuesUseCase: GetRevenues,
        private readonly createRevenueUseCase: CreateRevenue,
        private readonly deleteRevenueUseCase: DeleteRevenue,
        private readonly updateRevenueUseCase: UpdateRevenue,
    ) { }

    async getRevenues() {
        return await this.getRevenuesUseCase.execute();
    }

    async createRevenue(revenue: RevenueDTO) {
        return await this.createRevenueUseCase.execute(revenue)
    }

    async deleteRevenue(id: string) {
        return await this.deleteRevenueUseCase.execute(id);
    }

    async updateRevenue(id: string, revenue: RevenueDTO) {
        return await this.updateRevenueUseCase.execute(id, revenue);
    }
}