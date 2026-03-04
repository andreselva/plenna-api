import { Injectable, Logger } from "@nestjs/common";
import PaymentRegister from "./UseCases/PaymentRegister";
import PaymentInicialDataDTO from "./DTOs/PaymentInicialDataDTO";
import { InvoicesService } from "../Invoices/invoices.service";
import { PaymentType } from "./Types/payment.type";
import { ExpensesServices } from "../Expenses/ExpensesServices";
import GetPayments from "./UseCases/GetPayments";
import RevenuesService from "../Revenues/RevenuesService";
import { FinancialEventsService, IFinancialEvent } from "src/modules/financial-events/financial-events.service";
import { FinancialEventsEnum } from "src/enum/financial-events.enum";
import ReversePaymentDataDTO from "./DTOs/ReversePaymentDataDTO";
import DateHelper from "src/Shared/Utils/DateHelper";

@Injectable()
export default class PaymentService {
    private readonly logger = new Logger(PaymentService.name);

    constructor(
        private readonly paymentRegisterUC: PaymentRegister,
        private readonly invoiceService: InvoicesService,
        private readonly expenseService: ExpensesServices,
        private readonly getPaymentsUC: GetPayments,
        private readonly revenueService: RevenuesService,
        private readonly financialEventsService: FinancialEventsService
    ) { }

    async registerPayment(paymentData: PaymentInicialDataDTO) {
        if (paymentData && Object.keys(paymentData).length > 0) {
            const savedPayment = await this.paymentRegisterUC.register(paymentData);

            if (!savedPayment) {
                throw new Error("Failed to register payment");
            }

            await this.financialEventsService.register({
                accountId: paymentData.accountId,
                amount: paymentData.value,
                type: FinancialEventsEnum.PAYMENT_POSTED,
                referenceId: paymentData.payableId,
                referenceType: paymentData.payableType
            } satisfies IFinancialEvent)

            await this.updateStatus(paymentData.payableType, savedPayment.payable_id, savedPayment.payment_date);

        } else {
            throw new Error("Invalid payment data");
        }
    }

    async getPaymentsData(entityType: PaymentType, entityId: string) {
        try {
            return await this.getPaymentsUC.execute(entityType, entityId);
        } catch (error) {
            this.logger.error(error.message);
        }
    }

    async deletePayment(dto: ReversePaymentDataDTO) {
        try {
            const paymentDTO = new PaymentInicialDataDTO();
            paymentDTO.payableId = dto.entityId;
            paymentDTO.payableType = dto.referenceType;
            paymentDTO.paymentDate = DateHelper.getCurrentDate();
            paymentDTO.value = -Math.abs(dto.amount);

            const savedReversed = await this.paymentRegisterUC.register(paymentDTO);

            if (savedReversed !== null) {
                await this.financialEventsService.register({
                    accountId: dto.accountId,
                    amount: paymentDTO.value,
                    type: FinancialEventsEnum.REVERSAL,
                    referenceId: dto.entityId,
                    referenceType: dto.referenceType
                })
            }

            await this.updateStatus(paymentDTO.payableType, dto.entityId, null, true);

            //FALTA ATUALIZAR O PAGAMENTO COM A DATA DE ESTORNO.
            

        } catch (error) {
            throw new Error(`An error ocurred while delete payment: ${error.message}`);
        }
    }

    private async updateStatus(type: PaymentType, id: number, paymentDate: string | null, reversed: boolean = false) {
        try {
            switch(type) {
                case PaymentType.INVOICE:
                    if (reversed) {
                        //Ajustar depois para setar o status reversed
                        //this.invoiceService.updateInvoiceStatus(paymentData.payableId, paymentData.paymentDate)
                        break;
                    }
                    await this.invoiceService.updateInvoiceStatus(id, paymentDate);
                    break;
                case PaymentType.EXPENSE:
                    if (reversed) {
                        await this.expenseService.updateStatusExpense(id, null, true);
                        break;
                    }
                    await this.expenseService.updateStatusExpense(id, paymentDate);
                    break;
                case PaymentType.REVENUE:
                    if (reversed) {
                        //
                        break;
                    }
                    await this.revenueService.updateStatusRevenue(id, paymentDate);
                    break;
                default:
                    throw new Error(`Nenhum método de atualização de status encontrado para ${type}`);
            }
        } catch (error) {
            this.logger.error(`Erro retornado na atualização de status: ${error.message}`);
        }
    }
}