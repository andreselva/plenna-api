import { Injectable } from "@nestjs/common";
import Revenue from "../Entity/Revenue";
import { RevenueDTO } from "../DTOs/RevenueDTO";
import RevenuesRepository from "../RevenuesRepository";
import { FormatDate } from "src/Helpers/DateHelper/FormatDate";

@Injectable()
export default class CreateRevenue {
    constructor(
        private readonly revenueRepository: RevenuesRepository
    ) {}

    async execute(revenue: RevenueDTO) {
        revenue.invoiceDueDate = FormatDate.formatToYYYYMMDD(revenue.invoiceDueDate);
        const entity = Revenue.fromDTO(revenue);
        return await this.revenueRepository.createRevenue(entity);
    }
}