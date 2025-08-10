import { Injectable } from "@nestjs/common";
import { DateTime } from "luxon";
import InvoiceSettingsDTO from "../DTOs/invoice.settings.dto";
import InvoicesRepository from "../invoices.repository";
import Invoice from "src/EntityModels/invoice";

/**
 * @class CreateInvoiceUseCase
 * @description Caso de uso responsável por criar uma nova fatura.
 */
@Injectable()
export default class CreateInvoiceUseCase {
    constructor(
        private readonly repository: InvoicesRepository
    ) { }

    /**
     * Cria uma nova fatura com base nas configurações da conta.
     * Se já existir uma fatura, a próxima será gerada para o mês seguinte.
     * Se for a primeira fatura, as datas são calculadas com base no dia atual.
     * @param {InvoiceSettingsDTO} invoiceSettings - As configurações da conta para a criação da fatura.
     * @returns {Promise<Invoice>} A entidade da fatura criada.
     */
    async create(invoiceSettings: InvoiceSettingsDTO): Promise<Invoice> {
        const lastInvoice = await this.repository.searchInvoice(invoiceSettings.idAccount);
        const { closingDate, dueDate } = this.calculateNextInvoiceDates(invoiceSettings, lastInvoice);
        const newInvoice = new Invoice()
        newInvoice.closingDate = closingDate;
        newInvoice.dueDate = dueDate;
        newInvoice.idBankAccount = invoiceSettings.idAccount;
        newInvoice.name = invoiceSettings.nameAccount;
        newInvoice.id = 0,
        newInvoice.status = Invoice.STATUS_PENDING
        newInvoice.paymentDate = null;
        return await this.repository.createInvoice(newInvoice);
    }

    /**
     * Calcula as datas de fechamento e vencimento da próxima fatura.
     * @private
     * @param {InvoiceSettingsDTO} settings - As configurações da conta.
     * @param {Invoice | null} lastInvoice - A última fatura, se existir.
     * @returns {{ closingDate: string, dueDate: string }} As datas calculadas em formato ISO (YYYY-MM-DD).
     */
    private calculateNextInvoiceDates(settings: InvoiceSettingsDTO, lastInvoice: Invoice | null): { closingDate: string, dueDate: string } {
        const baseDate = lastInvoice 
            ? DateTime.fromISO(lastInvoice.closingDate)
            : DateTime.now();

        // Começamos com a data de fechamento do mês da nossa data base.
        let closingDateDt = baseDate.set({ day: settings.closingDate });

        if (closingDateDt <= DateTime.now() || lastInvoice) {
            closingDateDt = closingDateDt.plus({ months: 1 });
        }

        // A data de vencimento é calculada a partir do MÊS da data de fechamento.
        // Isso garante que elas estejam no mesmo ciclo de faturamento.
        let dueDateDt = closingDateDt.set({ day: settings.dueDate });

        if (dueDateDt <= closingDateDt) {
            dueDateDt = dueDateDt.plus({ months: 1 });
        }

        return {
            closingDate: closingDateDt.startOf('day').toISODate() as string,
            dueDate: dueDateDt.startOf('day').toISODate() as string,
        };
    }
}