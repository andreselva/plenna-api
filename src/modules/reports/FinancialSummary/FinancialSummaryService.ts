import { BadRequestException, Injectable } from "@nestjs/common";
import { AnalysisType } from "src/enum/analysis-type.enum";
import ReportsRepository from "src/modules/reports/reports.repository";
import { IFinancialSummaryInput } from "src/Shared/interfaces/IFinancialSummaryInput";
import { IFinancialSummaryOutput } from "src/Shared/interfaces/IFinancialSummaryOutput";
import { IReports } from "src/Shared/interfaces/IReports";
import DateHelper from "src/Shared/Utils/DateHelper";

@Injectable()
export default class FinancialSummaryService implements IReports<IFinancialSummaryInput, IFinancialSummaryOutput> {
    constructor(private readonly repository: ReportsRepository) {}
    
    async process(dto: IFinancialSummaryInput): Promise<IFinancialSummaryOutput> {
        const { initialDate, endDate } = this.definePeriod(dto);
        const categories = await this.repository.getCategories();
        const labels: string[] = [];
        const allExpenses: number[] = [];
        const allRevenues: number[] = [];
        const labelsMap = DateHelper.getMonthLabels();
        const monthsRange = DateHelper.listMonthsBetween(initialDate, endDate);

        const expenses = new Map(
            (await this.repository.getExpenses(initialDate, endDate))
            .map(expense => [`${expense.y}-${expense.m}`, Number(expense.total)])
        );

        const revenues = new Map(
            (await this.repository.getRevenues(initialDate, endDate))
            .map(revenue => [`${revenue.y}-${revenue.m}`, Number(revenue.total)])
        );

        for (const { y, m } of monthsRange) {
            labels.push(labelsMap.get(m)!)
            allExpenses.push(expenses.get(`${y}-${m}`) ?? 0)
            allRevenues.push(revenues.get(`${y}-${m}`) ?? 0)
        }

        return {
            allLabels: labels,
            allExpenseData: allExpenses,
            allIncomeData: allRevenues,
            summary: '----'
        }
    }

    private definePeriod(dto: IFinancialSummaryInput) {
        switch (dto.period) {
            case 1: {
                return DateHelper.getStartingAndEndDateOfCurrentMonth();
            }
            case 3:
            case 6:
            case 12: {
                const plus = dto.typeAnalysis === AnalysisType.FUTURE;
                return DateHelper.getFirstAndLastDateByNumberOfMonths(dto.period, plus);
            }
            default:
                throw new BadRequestException(`Invalid period.`);
        }
    }

}