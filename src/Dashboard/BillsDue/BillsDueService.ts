import { Injectable } from "@nestjs/common";
import { BillsDueRepository } from "./BillsDueRepository";
import { BillsDueResponseDTO } from "./DTOs/BillsDueResponseDTO";
import DashboardArgs from "../Args/DashboardArgs";

@Injectable()
export class BillsDueService {
    constructor(
        private readonly repository: BillsDueRepository
    ) { }

    async getBillsData(args: DashboardArgs): Promise<BillsDueResponseDTO[]> {
        const bills = await this.repository.getBills(args);

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