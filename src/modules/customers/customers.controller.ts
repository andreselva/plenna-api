import { Body, Controller, Post } from '@nestjs/common';
import { CustomerDTO } from './dtos/customer.dto';
import { CustomersService } from './customers.service';

@Controller('customers')
export class CustomersController {
    constructor(
        private readonly service: CustomersService
    ) {}
    
    @Post()
    async createCustomer(@Body() dto: CustomerDTO) {
        
    }
}
