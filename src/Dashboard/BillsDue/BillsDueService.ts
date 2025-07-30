import { Injectable } from "@nestjs/common";
import { BillsDueRepository } from "./BillsDueRepository";
import { BillsDueResponseDTO } from "./DTOs/BillsDueResponseDTO";
import DashboardArgs from "../Args/DashboardArgs";
import PeriodoDTO from "src/DTOs/PeriodoDTO";
import { InvoicesService } from "src/Finance/Invoices/invoices.service";
import { BillsDueDTO } from "./DTOs/BillsDueDTO";

@Injectable()
export class BillsDueService {
    constructor(
        private readonly repository: BillsDueRepository,
        private readonly invoicesService: InvoicesService
    ) { }

    async getBillsData(args: DashboardArgs): Promise<BillsDueResponseDTO[]> {
        const bills = await this.repository.getBills(args);
        const periodo = new PeriodoDTO();
        periodo.start = args.startDate;
        periodo.end = args.endDate;
        const invoices = (await this.invoicesService.getInvoices(periodo)).invoices;

        const newBillsFromInvoices = invoices.map(invoice => new BillsDueDTO(
            invoice.getName(),
            invoice.getDueDate(),
            invoice.getValue()
        ));

        bills.push(...newBillsFromInvoices);

        return bills.map(bill => new BillsDueResponseDTO(
            bill.name,
            bill.invoiceDueDate,
            new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(bill.value)
        ));
    }
}