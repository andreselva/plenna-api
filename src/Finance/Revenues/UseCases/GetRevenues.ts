import { Dependencies, Injectable } from "@nestjs/common";
import RevenuesRepository from "../RevenuesRepository";
import { FormatDate } from "src/Shared/Utils/FormatDate";

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
            invoiceDueDate: FormatDate.formatToYYYYMMDD(revenue.invoiceDueDate)
        }));
        return formattedRevenues;
    }
}