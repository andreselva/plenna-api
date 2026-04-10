import { BadRequestException, Injectable } from "@nestjs/common";
import { Expense } from "src/EntityModels/Expense";
import { AnalysisType } from "src/enum/analysis-type.enum";
import OpenAIService from "src/modules/integrations/openai/openai.service";
import ReportsRepository from "src/modules/reports/reports.repository";
import { IFinancialSummaryInput } from "src/Shared/interfaces/IFinancialSummaryInput";
import { IFinancialSummaryOutput } from "src/Shared/interfaces/IFinancialSummaryOutput";
import { IReports } from "src/Shared/interfaces/IReports";
import DateHelper from "src/Shared/Utils/DateHelper";

type RevenueRow = {
    y: number | string;
    m: number | string;
    total: number | string;
};

type CategoryRow = {
    id: number | string;
    name: string;
};

@Injectable()
export default class FinancialSummaryService implements IReports<IFinancialSummaryInput, IFinancialSummaryOutput> {
    constructor(
        private readonly repository: ReportsRepository,
        private readonly openaiService: OpenAIService
    ) {}

    async process(dto: IFinancialSummaryInput): Promise<IFinancialSummaryOutput> {
        const { initialDate, endDate } = this.definePeriod(dto);
        const labelsMap = DateHelper.getMonthLabels();
        const monthsRange = DateHelper.listMonthsBetween(initialDate, endDate);

        const revenueRows = await this.repository.getRevenues(initialDate, endDate) as RevenueRow[];

        const revenues = new Map<string, number>(
            revenueRows.map((revenue) => {
                const year = Number(revenue.y);
                const month = Number(revenue.m);
                const total = Number(revenue.total);

                return [DateHelper.ymKey(year, month), total];
            })
        );

        const expenses = await this.repository.getExpenses(initialDate, endDate);
        const groupedExpenses = this.groupExpensesByDueDate(expenses);
        const groupedExpensesByCategory = await this.groupExpensesByCategory(expenses);

        const labels: string[] = [];
        const allExpenses: number[] = [];
        const allRevenues: number[] = [];

        for (const monthRange of monthsRange) {
            const year = Number(monthRange.y);
            const month = Number(monthRange.m);
            const key = DateHelper.ymKey(year, month);

            labels.push(labelsMap.get(month) ?? String(month));
            allExpenses.push(groupedExpenses.get(key)?.value ?? 0);
            allRevenues.push(revenues.get(key) ?? 0);
        }

        const summary = await this.openaiService.gerarRelatorio({
            expenses: allExpenses,
            revenues: allRevenues,
            categories: Array.from(groupedExpensesByCategory.values())
        }) as string;

        return {
            allLabels: labels,
            allExpenseData: allExpenses,
            allIncomeData: allRevenues,
            summary
        };
    }

    private definePeriod(dto: IFinancialSummaryInput): { initialDate: string; endDate: string } {
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
                throw new BadRequestException('Invalid period.');
        }
    }

    private groupExpensesByDueDate(expenses: Expense[]): Map<string, { label: string; value: number }> {
        const labelsMap = DateHelper.getMonthLabels();
        const groupedExpenses = new Map<string, { label: string; value: number }>();

        for (const expense of expenses) {
            const dueDate = String(expense.invoiceDueDate);
            const { yearAndMonth, month } = DateHelper.getYearAndMonth(dueDate);

            if (!yearAndMonth || !month) continue;

            const current = groupedExpenses.get(yearAndMonth);
            const expenseValue = Number(expense.value);

            if (current) {
                current.value += expenseValue;
            } else {
                groupedExpenses.set(yearAndMonth, {
                    label: labelsMap.get(Number(month)) ?? String(month),
                    value: expenseValue,
                });
            }
        }

        return groupedExpenses;
    }

    private async groupExpensesByCategory(expenses: Expense[]): Promise<Map<string, { label: string; value: number }>> {
        const categories = await this.repository.getCategories() as CategoryRow[];

        const byCategory = new Map<string, { label: string; value: number }>();

        for (const expense of expenses) {
            const expenseCategoryId = Number(expense.idCategory);
            const categoryName = categories.find((category) => Number(category.id) === expenseCategoryId)?.name;

            if (!categoryName) continue;

            const current = byCategory.get(categoryName);
            const expenseValue = Number(expense.value);

            if (current) {
                current.value += expenseValue;
            } else {
                byCategory.set(categoryName, {
                    label: categoryName,
                    value: expenseValue
                });
            }
        }

        return byCategory;
    }
}