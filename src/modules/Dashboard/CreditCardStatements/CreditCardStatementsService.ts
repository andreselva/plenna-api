import { Injectable } from "@nestjs/common";
import CreditCardStatementsChartConfig from "./ChartConfig/CreditCardStatementsChartConfig";
import DashboardCreditCardDatasetDTO from "./DTOs/DashboardCreditCardDatasetDTO";
import DashboardCreditCardStatementsDTO from "./DTOs/DashboardCreditCardStatementsDTO";
import DashboardArgs from "../Args/DashboardArgs";
import PeriodoDTO from "src/DTOs/PeriodoDTO";
import { InvoicesService } from "src/modules/Finance/Invoices/invoices.service";

@Injectable()
export default class CreditCardStatementsService {
    constructor(
        private readonly invoicesService: InvoicesService
    ) { }

    async getData(args: DashboardArgs) {
        const periodo = new PeriodoDTO();
        periodo.start = args.startDate;
        periodo.end = args.endDate;
        const invoices = (await this.invoicesService.getInvoices(periodo)).invoices;
        const labels: string[] = [];
        const values: number[] = [];

        invoices.forEach((invoice) => {
            labels.push(invoice.name);
            values.push(invoice.value);
        });

        const highestBillCard = invoices.reduce((prev, curr) => {
            return curr.value > prev.value ? curr : prev;
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

        return { data, highestBillCard };
    }
}