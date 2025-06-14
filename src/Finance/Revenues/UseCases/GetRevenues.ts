import { Dependencies, Injectable } from "@nestjs/common";
import RevenuesRepository from "../RevenuesRepository";
import PeriodoDTO from "src/DTOs/PeriodoDTO";
import DateHelper from "src/Shared/Utils/DateHelper";

@Injectable()
@Dependencies(RevenuesRepository)
export default class GetRevenues {
    constructor(
        private readonly revenuesRepository: RevenuesRepository
    ) { }

    async execute(periodo: PeriodoDTO) {
        const revenues = await this.revenuesRepository.getRevenues(periodo);
        const formattedRevenues = revenues.map(revenue => ({
            ...revenue,
            invoiceDueDate: DateHelper.toISODate(revenue.invoiceDueDate)
        }));
        return formattedRevenues;
    }
}