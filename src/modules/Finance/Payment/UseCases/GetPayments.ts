import { Injectable } from "@nestjs/common";
import { PaymentRepository } from "../payment.repository";

@Injectable()
export default class GetPayments {
    constructor(
        private readonly repository: PaymentRepository
    ) { }

    async execute(entityType: string, entityId: string) {
        if (entityType && entityId) {
            const payments = await this.repository.getPaymentsByEntity(entityType, entityId);
            if (!payments || payments.length === 0) {
                return { "payments": [] };
            }

            return { payments: payments };
        } else {
            throw new Error("Entity type and ID are required");
        }
    }
}