import { Injectable } from "@nestjs/common";
import ReversePaymentDataDTO from "../DTOs/ReversePaymentDataDTO";
import { PaymentRepository } from "../payment.repository";
import { PaymentType } from "../Types/payment.type";

@Injectable()
export default class DeletePayment {
    constructor(
        private readonly repository: PaymentRepository
    ) { }

    async delete(dto: ReversePaymentDataDTO) {
        if (!dto || !dto.paymentId || !dto.entityType || !dto.entityId) {
            throw new Error("Invalid data provided for payment deletion");
        }
        if (!Object.values(PaymentType).includes(dto.entityType)) {
            throw new Error("Invalid payment type");
        }

        return await this.repository.deletePayment(dto);
    }
}