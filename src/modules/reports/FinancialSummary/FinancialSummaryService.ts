import { Injectable } from "@nestjs/common";
import ReportsRepository from "src/modules/reports/reports.repository";
import { IFinancialSummaryInput } from "src/Shared/interfaces/IFinancialSummaryInput";
import { IFinancialSummaryOutput } from "src/Shared/interfaces/IFinancialSummaryOutput";
import { IReports } from "src/Shared/interfaces/IReports";
import DateHelper from "src/Shared/Utils/DateHelper";

@Injectable()
export default class FinancialSummaryService implements IReports<IFinancialSummaryInput, IFinancialSummaryOutput> {
    private labels = DateHelper.getMonthLabels();
    constructor(private readonly repository: ReportsRepository) {}
    
    async proccess(dto: IFinancialSummaryInput): Promise<IFinancialSummaryOutput> {
        const { initialDate, endDate } = DateHelper.getStartingAndEndDateOfCurrentMonth();
        const categories = await this.repository.getCategories();
        const labels: string[] = [];
        const allExpenses: number[] = [];
        const allRevenues: number[] = [];

        if (dto.period === 1) {
            const month = DateHelper.getMonthOfDate(initialDate);
            labels.push(this.labels.get(month) as string);
            
            const sumExpenses = (await this.repository.getExpenses(initialDate, endDate))
                .reduce((acc, expense) => Number(acc) + Number(expense.value), 0);
            const sumRevenues = (await this.repository.getRevenues(initialDate, endDate))
                .reduce((acc, revenue) => Number(acc) + Number(revenue.value), 0);
            
            allExpenses.push(sumExpenses);
            allRevenues.push(sumRevenues);
        }

        return {
            allLabels: labels,
            allExpenseData: allExpenses,
            allIncomeData: allRevenues,
            summary: '----'
        }
    }

}