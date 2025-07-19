import { Injectable } from "@nestjs/common";
import InvoiceSettingsDTO from "../DTOs/invoice.settings.dto";
import Invoice from "../Entity/invoice";
import InvoicesRepository from "../invoices.repository";
import { DateTime } from "luxon";

@Injectable()
export default class CreateInvoiceUseCase {
    constructor(
        private readonly repository: InvoicesRepository
    ) { }

    async create(invoiceSettings: InvoiceSettingsDTO) {
        try {
            let closingDate: string;
            let dueDate: string;

            const lastInvoice = await this.repository.searchInvoice(invoiceSettings.idAccount);
            if (lastInvoice) {
                const lastClosingDate = lastInvoice.getClosingDate();
                const lastDueDate = lastInvoice.getDueDate();
                const nextClosingDateDt = DateTime.fromISO(lastClosingDate).plus({ months: 1 });
                const nextDueDateDt = DateTime.fromISO(lastDueDate).plus({ months: 1 });
                closingDate = nextClosingDateDt.toISODate() as string;
                dueDate = nextDueDateDt.toISODate() as string;
            } else {
                const now = DateTime.now();
                let closingDateDt = now.set({ day: invoiceSettings.closingDate });
                let dueDateDt = now.set({ day: invoiceSettings.dueDate });

                if (closingDateDt < now) {
                    closingDateDt = closingDateDt.plus({ months: 1 });
                }

                if (dueDateDt <= closingDateDt) {
                    dueDateDt = dueDateDt.plus({ months: 1 });
                }

                closingDate = closingDateDt.startOf('day').toISODate() as string;
                dueDate = dueDateDt.startOf('day').toISODate() as string;
            }

            if (!closingDate || !dueDate) {
                throw new Error("Não foi possível determinar as datas de fecho e vencimento.");
            }

            const entity = new Invoice(
                closingDate,
                dueDate,
                invoiceSettings.idAccount,
                invoiceSettings.nameAccount,
                undefined,
                'pending'
            );

            return this.repository.createInvoice(entity);
        } catch (err) {
            console.error("Erro ao criar a fatura:", err);
            throw new Error("Ocorreu um erro ao tentar criar a fatura.");
        }
    }
}