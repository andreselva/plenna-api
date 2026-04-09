import { Body, Controller, Headers, Inject, Logger, Param, Post } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ChargeStatus } from 'src/enum/charge-status.enum';
import { GatewayIntegrationsService } from 'src/modules/integrations/gateways/gateways-integrations.service';
import { ChargesRepository } from '../charges.repository';
import { ChargesService } from '../charges.service';

@Controller('webhooks/charges')
export class ChargesWebhookController {
    private readonly logger = new Logger(ChargesWebhookController.name);

    constructor(
        private readonly chargesService: ChargesService,
        private readonly chargesRepository: ChargesRepository,
        private readonly gatewayIntegrationsService: GatewayIntegrationsService,
        @Inject(REQUEST) private readonly request: any,
    ) {}

    @Post(':gateway')
    async handleWebhook(
        @Param('gateway') gateway: string,
        @Body() payload: unknown,
        @Headers() headers: Record<string, string>,
    ) {
        try {
            const parsed = this.gatewayIntegrationsService.parseWebhook(gateway, payload, headers);

            if (!parsed.externalId) {
                this.logger.warn(`Webhook from ${gateway} missing externalId`);
                return { received: true };
            }

            const charge = await this.chargesRepository.findByExternalId(parsed.externalId);
            if (!charge) {
                this.logger.warn(`Webhook: charge not found for externalId ${parsed.externalId}`);
                return { received: true };
            }

            // Injeta clientId no contexto da requisição para que AuthContextService funcione
            this.request.user = { clientId: charge.clientId };

            switch (parsed.newStatus) {
                case ChargeStatus.PAID:
                    await this.chargesService.markAsPaid(charge.id, parsed.paidAt);
                    break;
                case ChargeStatus.FAILED:
                    await this.chargesService.markAsFailed(charge.id);
                    break;
                case ChargeStatus.CANCELED:
                    await this.chargesService.cancel(charge.id);
                    break;
                default:
                    this.logger.log(`Webhook: unhandled status ${parsed.newStatus} for charge ${charge.id}`);
            }
        } catch (error: any) {
            // Loga o erro mas retorna 200 para evitar reentrega desnecessária do gateway
            this.logger.error(`Webhook processing error: ${error.message}`, error.stack);
        }

        return { received: true };
    }
}
