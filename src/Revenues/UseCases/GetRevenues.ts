import { Dependencies, Injectable } from "@nestjs/common";
import RevenuesRepository from "../RevenuesRepository";
import { FormatDate } from "src/Helpers/DateHelper/FormatDate";

@Injectable()
@Dependencies(RevenuesRepository)
export default class GetRevenues {
    constructor(
        private readonly revenuesRepository: RevenuesRepository
    ) { }

    async execute() {
        const revenues = await this.revenuesRepository.getRevenues();
        const formattedRevenues = revenues.map(revenue => ({
            ...revenue,
            invoiceDueDate: FormatDate.formatDateToDDMMYYYY(revenue.invoiceDueDate)
        }));
        return formattedRevenues;
    }
}