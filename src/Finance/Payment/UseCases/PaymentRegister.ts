import { Injectable } from "@nestjs/common";
import { PaymentRepository } from "../payment.repository";
import Payment from "../Entity/Payment";
import PaymentInicialDataDTO from "../DTOs/PaymentInicialDataDTO";

@Injectable()
export default class PaymentRegister {
    constructor(
        private readonly paymentRepository: PaymentRepository
    ) { }

    async register(payment: PaymentInicialDataDTO) {
        const entity = new Payment(payment);
        return await this.paymentRepository.save(entity);
    }
}