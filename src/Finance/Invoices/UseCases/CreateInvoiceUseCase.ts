import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { DateTime } from "luxon";
import InvoiceSettingsDTO from "../DTOs/invoice.settings.dto";
import Invoice from "../Entity/invoice";
import InvoicesRepository from "../invoices.repository";

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
     * @throws {InternalServerErrorException} Se ocorrer um erro durante o processo.
     */
    async create(invoiceSettings: InvoiceSettingsDTO): Promise<Invoice> {
        try {
            const lastInvoice = await this.repository.searchInvoice(invoiceSettings.idAccount);

            const { closingDate, dueDate } = this.calculateNextInvoiceDates(invoiceSettings, lastInvoice);

            const newInvoice = new Invoice(
                closingDate,
                dueDate,
                invoiceSettings.idAccount,
                invoiceSettings.nameAccount,
                undefined,
                'pending'
            );

            const result = await this.repository.createInvoice(newInvoice);

            if (result?.isSuccess) {
                return result.createdInvoice;
            } else {
                throw new Error("O repositório não conseguiu criar a fatura.");
            }

        } catch (error) {
            console.error("Erro detalhado ao criar a fatura:", error);
            throw new InternalServerErrorException("Ocorreu um erro ao tentar criar a fatura.");
        }
    }

    /**
     * Calcula as datas de fechamento e vencimento da próxima fatura.
     * @private
     * @param {InvoiceSettingsDTO} settings - As configurações da conta.
     * @param {Invoice | null} lastInvoice - A última fatura, se existir.
     * @returns {{ closingDate: string, dueDate: string }} As datas calculadas em formato ISO (YYYY-MM-DD).
     */
    private calculateNextInvoiceDates(settings: InvoiceSettingsDTO, lastInvoice: Invoice | null): { closingDate: string, dueDate: string } {
        // Se já existe uma fatura anterior, calcula o próximo mês.
        if (lastInvoice) {
            const nextClosingDate = DateTime.fromISO(lastInvoice.getClosingDate()).plus({ months: 1 });
            const nextDueDate = DateTime.fromISO(lastInvoice.getDueDate()).plus({ months: 1 });

            return {
                closingDate: nextClosingDate.toISODate() as string,
                dueDate: nextDueDate.toISODate() as string,
            };
        }

        // Se for a primeira fatura, calcula com base nas configurações e na data atual.
        const now = DateTime.now();
        let closingDateDt = now.set({ day: settings.closingDate });

        // Se a data de fechamento já passou neste mês, avança para o próximo.
        if (closingDateDt <= now) {
            closingDateDt = closingDateDt.plus({ months: 1 });
        }

        let dueDateDt = now.set({ day: settings.dueDate });

        // A data de vencimento deve ser sempre após a data de fechamento.
        if (dueDateDt < closingDateDt) {
            dueDateDt = dueDateDt.plus({ months: 2 });
        } else if (dueDateDt === closingDateDt) {
            dueDateDt = dueDateDt.plus({ months: 1 });
        }

        return {
            closingDate: closingDateDt.startOf('day').toISODate() as string,
            dueDate: dueDateDt.startOf('day').toISODate() as string,
        };
    }
}