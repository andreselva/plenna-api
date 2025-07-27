import { Injectable } from "@nestjs/common";
import { PaymentRepository } from "../payment.repository";
import DateHelper from "src/Shared/Utils/DateHelper";

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

            payments.map(payment => {
                let paymentDate = payment.getPaymentDate();
                paymentDate = DateHelper.toISODate(paymentDate) ?? '';
                payment.setPaymentDate(paymentDate);
            })

            return { "payments": payments };
        } else {
            throw new Error("Entity type and ID are required");
        }
    }
}