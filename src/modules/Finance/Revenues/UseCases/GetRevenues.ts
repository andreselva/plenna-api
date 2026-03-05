import { Dependencies, Injectable } from "@nestjs/common";
import RevenuesRepository from "../RevenuesRepository";
import PeriodoDTO from "src/DTOs/PeriodoDTO";

@Injectable()
@Dependencies(RevenuesRepository)
export default class GetRevenues {
    constructor(
        private readonly revenuesRepository: RevenuesRepository
    ) { }

    async execute(periodo: PeriodoDTO) {
        const revenues = await this.revenuesRepository.getRevenues(periodo);
        const promiseArray = revenues.map(async (revenue) => {
            const payments = await this.revenuesRepository.getTotalPayments(revenue.id);
            const totalPayments = payments.reduce((acc, p) => acc + p.value, 0);
            revenue.totalPaid = totalPayments;
            return revenue;
        })

        const formattedRevenues = await Promise.all(promiseArray);
        return { revenues: formattedRevenues };
    }
}