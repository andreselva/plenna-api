import { Injectable } from '@nestjs/common';
import { CustomersRepository } from './customers.repository';
import { CustomerDTO } from './dtos/customer.dto';
import { Customer } from 'src/EntityModels/Customer';

@Injectable()
export class CustomersService {
    constructor(
        private readonly repository: CustomersRepository
    ) {}

    async createCustomer(dto: CustomerDTO) {
        const entity = Customer.fromDTO(dto);
        await this.repository.save(entity);
    }

    async getAllCustomer() {
        return await this.repository.loadAll();
    }

    async getCustomerById(id: number) {
        return await this.repository.loadById(id);
    }

    async updateCustomer(id: number, dto: CustomerDTO) {
        const entity = Customer.fromDTO(dto);
        entity.id = id;
        if (entity.id === undefined || entity.id === null) {
            throw new Error('Customer ID is required for update');
        }
        await this.repository.save(entity);
    }
}
