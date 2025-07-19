import { Injectable } from "@nestjs/common";
import CreditCardStatementsChartConfig from "./ChartConfig/CreditCardStatementsChartConfig";
import DashboardCreditCardDatasetDTO from "./DTOs/DashboardCreditCardDatasetDTO";
import DashboardCreditCardStatementsDTO from "./DTOs/DashboardCreditCardStatementsDTO";
import DashboardArgs from "../Args/DashboardArgs";
import { InvoicesService } from "src/Finance/Invoices/invoices.service";
import PeriodoDTO from "src/DTOs/PeriodoDTO";

@Injectable()
export default class CreditCardStatementsService {
    constructor(
        private readonly invoicesService: InvoicesService
    ) { }

    async getData(args: DashboardArgs) {
        const periodo = new PeriodoDTO();
        periodo.start = args.startDate;
        periodo.end = args.endDate;
        const invoices = await this.invoicesService.getInvoices(periodo);
        const labels: string[] = [];
        const values: number[] = [];

        invoices.forEach((invoice) => {
            labels.push(invoice.getName());
            values.push(invoice.getValue());
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