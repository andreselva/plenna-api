import { Dependencies, Injectable } from "@nestjs/common";
import RevenuesRepository from "../RevenuesRepository";
import { FormatDate } from "src/Shared/Utils/FormatDate";
import PeriodoDTO from "src/DTOs/PeriodoDTO";

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
            invoiceDueDate: FormatDate.formatToYYYYMMDD(revenue.invoiceDueDate)
        }));
        return formattedRevenues;
    }
}