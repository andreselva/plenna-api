import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { CustomersRepository } from './customers.repository';

@Module({
  providers: [CustomersService, CustomersRepository],
  controllers: [CustomersController]
})
export class CustomersModule {}
