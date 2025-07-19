import { Injectable } from "@nestjs/common";
import PaymentRepository from "../payment.repository";
import Payment from "../Entity/Payment";
import PaymentInicialDataDTO from "../DTOs/PaymentInicialDataDTO";

@Injectable()
export default class PaymentRegister {
    constructor(
        private readonly paymentRepository: PaymentRepository
    ) { }

    async register(payment: PaymentInicialDataDTO) {
        const entity = new Payment(
            payment.paymentInformation.amount,
            payment.paymentInformation.date,
            payment.invoice.expenses,
            payment.invoice.id,
        );
        return await this.paymentRepository.save(entity);
    }
}