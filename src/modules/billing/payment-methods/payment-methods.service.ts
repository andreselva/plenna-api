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
}
