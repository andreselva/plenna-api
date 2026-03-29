import { Injectable } from '@nestjs/common';
import { PaymentMethodsRepository } from './payment-methods.repository';

@Injectable()
export class PaymentMethodsService {
    constructor(
        private readonly repository: PaymentMethodsRepository
    ) {}

    async getPaymentMethods() {
        return await this.repository.getPaymentMethods();
    }

    async updatePaymentMethod(id: number) {
        return await this.repository.updatePaymentMethodForClient(id, true);
    }

    async getpaymentMethodByClient() {
        return await this.repository.getPaymentMethodByClient();
    }
}
