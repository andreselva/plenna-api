import { Injectable } from '@nestjs/common';
import { CustomersRepository } from './customers.repository';

@Injectable()
export class CustomersService {
    constructor(
        private readonly repository: CustomersRepository
    ) {}
}
