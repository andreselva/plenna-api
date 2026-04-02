import { Injectable } from '@nestjs/common';
import { CreateChargeDto } from './dtos/create-charge.dto';
import { ChargesRepository } from './charges.repository';
import { ChargesException } from './exceptions/ChargesException';
import { ChargesEngine } from './charges.engine';
import { Charge } from 'src/EntityModels/Charge';
import { ChargeGatewayService } from './charge-gateway.service';
import { ResultSetHeader } from 'mysql2';
import { IGatewayOperationResult } from 'src/Shared/interfaces/IGatewayOperationResult';
import { ChargesFactory } from './charges.factory';

@Injectable()
export class ChargesService {
    constructor(
        private readonly repository: ChargesRepository,
        private readonly engine: ChargesEngine,
        private readonly chargeGatewayService: ChargeGatewayService,
        private readonly factory: ChargesFactory
    ) {}

    async create(dto: CreateChargeDto) {
        try {
            const input = await this.factory.resolve(dto.type, dto.entityId);
            if (!input) {
                throw new ChargesException(`Entity of type ${dto.type} with ID ${dto.entityId} not found`);
            }
    
            const charge: Charge = await this.engine.process(input);
            const result = await this.repository.save(charge);
            charge.id = (result as ResultSetHeader).insertId;
            
            if (charge.gatewayId > 0) {
                const gatewayResult = await this.chargeGatewayService.sendCharge(charge);
                await this.syncGatewayResponse(charge, gatewayResult);
            }
    
            return charge;
        } catch (error) {
            throw new ChargesException(`Error creating charge: ${error.message}`);
        }
    }

    private async syncGatewayResponse(charge: Charge, gatewayResult: IGatewayOperationResult) {
        charge.status = gatewayResult.status;
        charge.externalId = gatewayResult.externalId ?? charge.externalId;
        charge.paymentLink = gatewayResult.paymentLink ?? charge.paymentLink;
        charge.qrcode = gatewayResult.qrcode ?? charge.qrcode;
        charge.paymentAt = gatewayResult.paidAt ?? charge.paymentAt;
        await this.repository.save(charge, true);
    }

    async getCharges() {
        return await this.repository.loadAll();
    }
}
