import { Injectable } from '@nestjs/common';
import { CreateChargeDto } from './dtos/create-charge.dto';
import { ChargesRepository } from './charges.repository';
import { ChargesException } from './exceptions/ChargesException';
import { ChargesEngine } from './charges.engine';
import { Charge } from 'src/EntityModels/Charge';
import { ChargeGatewayService } from './charge-gateway.service';
import { ResultSetHeader } from 'mysql2';
import { IGatewayOperationResult } from 'src/Shared/interfaces/IGatewayOperationResult';

@Injectable()
export class ChargesService {
    constructor(
        private readonly repository: ChargesRepository,
        private readonly engine: ChargesEngine,
        private readonly chargeGatewayService: ChargeGatewayService
    ) {}

    async create(dto: CreateChargeDto) {
        const expense = await this.repository.loadExpense(dto.expenseId);
        if (!expense) {
            throw new ChargesException('Expense not found');
        }

        const charge: Charge = await this.engine.process(expense);
        const result = await this.repository.save(charge);
        charge.id = (result as ResultSetHeader).insertId;
        
        if (charge.gatewayId > 0) {
            const gatewayResult = await this.chargeGatewayService.sendCharge(charge);
            await this.syncGatewayResponse(charge, gatewayResult);
        }

        return charge;
    }

    private async syncGatewayResponse(charge: Charge, gatewayResult: IGatewayOperationResult) {
        charge.status = gatewayResult.status;
        charge.externalId = gatewayResult.externalId ?? charge.externalId;
        charge.paymentLink = gatewayResult.paymentLink ?? charge.paymentLink;
        charge.qrcode = gatewayResult.qrcode ?? charge.qrcode;
        charge.paymentAt = gatewayResult.paidAt ?? charge.paymentAt;
        await this.repository.save(charge, true);
    }
}
