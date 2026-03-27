import { Injectable } from '@nestjs/common';
import { CreateChargeDto } from './dtos/create-charge.dto';
import { ChargesRepository } from './charges.repository';
import { ChargesException } from './exceptions/ChargesException';
import { ChargesEngine } from './charges.engine';
import { Charge } from 'src/EntityModels/Charge';

@Injectable()
export class ChargesService {
    constructor(
        private readonly repository: ChargesRepository,
        private readonly engine: ChargesEngine
    ) {}

    async create(dto: CreateChargeDto) {
        const expense = await this.repository.loadExpense(dto.expenseId);
        if (Object.keys(expense).length === 0) {
            throw new ChargesException('Expense not found');
        }
        
        const charge: Charge = await this.engine.process(expense);
        if (charge.gatewayId > 0) {
            
        }

        await this.repository.save(charge);
    }
}
