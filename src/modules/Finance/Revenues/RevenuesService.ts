import { Dependencies, Injectable } from "@nestjs/common";
import CreateRevenue from "./UseCases/CreateRevenue";
import GetRevenues from "./UseCases/GetRevenues";
import { RevenueDTO } from "./DTOs/RevenueDTO";
import { DeleteRevenue } from "./UseCases/DeleteRevenue";
import { UpdateRevenue } from "./UseCases/UpdateRevenue";
import PeriodoDTO from "src/DTOs/PeriodoDTO";
import MySQLDatabase from "src/modules/Config/Database/MySQLDatabase";

@Injectable()
export default class RevenuesService {
    constructor(
        private readonly database: MySQLDatabase,
        private readonly getRevenuesUseCase: GetRevenues,
        private readonly createRevenueUseCase: CreateRevenue,
        private readonly deleteRevenueUseCase: DeleteRevenue,
        private readonly updateRevenueUseCase: UpdateRevenue,
    ) { }

    async getRevenues(periodo: PeriodoDTO) {
        return await this.getRevenuesUseCase.execute(periodo);
    }

    async createRevenue(revenue: RevenueDTO, periodo: PeriodoDTO) {
        if ((revenue.typeOfInstallments === 'P' && revenue.installments && revenue.installments > 0) || revenue.typeOfInstallments === 'F') {
            revenue.hasInstallments = true;
        }
        
        return await this.createRevenueUseCase.execute(revenue, periodo)
    }

    async deleteRevenue(id: string, deleteInstallments: string, sourceAccountId: string, periodo: PeriodoDTO) {
        const deleteAnotherInstallments = deleteInstallments === 'false' ? false : true;
        return this.database.transaction(async () => {
            await this.deleteRevenueUseCase.execute(Number(id), deleteAnotherInstallments, Number(sourceAccountId));
            return await this.getRevenuesUseCase.execute(periodo);
        })
    }

    async updateRevenue(id: string, revenue: RevenueDTO, periodo: PeriodoDTO) {
        return await this.updateRevenueUseCase.execute(Number(id), revenue, periodo);
    }

    async updateStatusRevenue(id: number, paymentDate: string|null) {
        if (paymentDate === '') {
            paymentDate = null;
        }
        return await this.updateRevenueUseCase.updateRevenueStatus(id, paymentDate);
    };
}