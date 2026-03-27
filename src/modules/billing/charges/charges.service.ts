import { Injectable } from '@nestjs/common';
import { CreateChargeDto } from './dtos/create-charge.dto';
import { ChargesRepository } from './charges.repository';
import { ChargesException } from './exceptions/ChargesException';

@Injectable()
export class ChargesService {
    constructor(private readonly repository: ChargesRepository) {}

    async process(dto: CreateChargeDto) {
        const expense = await this.repository.loadExpense(dto.expenseId);
        if (Object.keys(expense).length === 0) {
            throw new ChargesException('Expense not found');
        }
    }
}
