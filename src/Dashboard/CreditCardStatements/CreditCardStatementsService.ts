import { Injectable } from "@nestjs/common";
import CreditCardStatementsChartConfig from "./ChartConfig/CreditCardStatementsChartConfig";
import CreditCardStatementsRepository from "./CreditCardStatementsRepository";
import DashboardCreditCardDatasetDTO from "./DTOs/DashboardCreditCardDatasetDTO";
import DashboardCreditCardStatementsDTO from "./DTOs/DashboardCreditCardStatementsDTO";

@Injectable()
export default class CreditCardStatementsService {
    constructor(
        private readonly repository: CreditCardStatementsRepository
    ) { }

    async getData() {
        const expenses = await this.repository.getExpenses();
        const labels: string[] = [];
        const values: number[] = [];

        expenses.forEach((expense) => {
            labels.push(expense.card);
            values.push(expense.value);
        });

        const data = new DashboardCreditCardStatementsDTO(
            labels,
            [
                new DashboardCreditCardDatasetDTO(
                    'Faturas',
                    values,
                    CreditCardStatementsChartConfig.getBackgroundColor(),
                    CreditCardStatementsChartConfig.getBorderColor(),
                    CreditCardStatementsChartConfig.getBorderWidth(),
                    CreditCardStatementsChartConfig.getBorderRadius(),
                )
            ]
        );
        return data;
    }
}