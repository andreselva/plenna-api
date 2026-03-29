import { Injectable } from '@nestjs/common';
import { CreateChargeDto } from './dtos/create-charge.dto';
import { ChargesRepository } from './charges.repository';
import { ChargesException } from './exceptions/ChargesException';
import { ChargesEngine } from './charges.engine';
import { Charge } from 'src/EntityModels/Charge';
import { GatewayIntegrationsService } from 'src/modules/integrations/gateways/gateways-integrations.service';

@Injectable()
export class ChargesService {
    constructor(
        private readonly repository: ChargesRepository,
        private readonly engine: ChargesEngine,
        private readonly gatewayIntegrationsService: GatewayIntegrationsService
    ) {}

    async create(dto: CreateChargeDto) {
        const expense = await this.repository.loadExpense(dto.expenseId);
        if (Object.keys(expense).length === 0) {
            throw new ChargesException('Expense not found');
        }

        const charge: Charge = await this.engine.process(expense);
        await this.repository.save(charge);
        
        if (charge.gatewayId > 0) {
            await this.gatewayIntegrationsService.sendChargeToGateway(charge);
        }

        return charge;
    }
}
