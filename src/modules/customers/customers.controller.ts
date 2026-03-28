import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CustomerDTO } from './dtos/customer.dto';
import { CustomersService } from './customers.service';

@Controller('customers')
export class CustomersController {
    constructor(
        private readonly service: CustomersService
    ) {}
    
    @Get()
    async getCustomers() {
        return await this.service.getAllCustomer();
    }

    @Get('/:id')
    async getCustomerById(@Param('id') id: string) {
        return await this.service.getCustomerById(Number(id));
    }

    @Post()
    async createCustomer(@Body() dto: CustomerDTO) {
        await this.service.createCustomer(dto);
    }
}
