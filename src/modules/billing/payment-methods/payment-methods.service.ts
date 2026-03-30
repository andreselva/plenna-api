import { Injectable } from '@nestjs/common';
import { PaymentMethodsRepository } from './payment-methods.repository';

@Injectable()
export class PaymentMethodsService {
    constructor(
        private readonly repository: PaymentMethodsRepository
    ) {}

    async getPaymentMethods() {
        const paymentMethods = await this.repository.getPaymentMethodsWithClientStatus();

        return {
            paymentMethods,
        };
    }

    async updatePaymentMethod(code: string, isActive: boolean) {
        const paymentMethod = await this.repository.updatePaymentMethodForClientByCode(code, isActive);

        return {
            paymentMethod,
        };
    }

    async getpaymentMethodByClient() {
        const paymentMethods = await this.repository.getPaymentMethodByClient();

        return {
            paymentMethods,
        };
    }
}