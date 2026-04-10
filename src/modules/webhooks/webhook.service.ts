import { Injectable, Logger } from "@nestjs/common";
import { ChargesService } from "../billing/charges/charges.service";
import { GatewayIntegrationsService } from "../integrations/gateways/gateways-integrations.service";

@Injectable()
export class WebhookService {
    private readonly logger = new Logger(WebhookService.name);

    constructor(
        private readonly chargesService: ChargesService,
        private readonly gatewayIntegrationsService: GatewayIntegrationsService,
    ) {}

    async handleWebhook(gateway: string, payload: unknown, headers: Record<string, string>, request: any) {
        try {
            const parsed = this.gatewayIntegrationsService.parseWebhook(gateway, payload, headers);

            if (!parsed.externalId) {
                this.logger.warn(`Webhook from ${gateway} missing externalId`);
                return { received: true };
            }

            const charge = await this.chargesService.findByExternalId(parsed.externalId);
            if (!charge) {
                this.logger.warn(`Webhook: charge not found for externalId ${parsed.externalId}`);
                return { received: true };
            }

            // Injeta clientId no contexto da requisição para que AuthContextService funcione
            request.user = { clientId: charge.clientId };

            await this.chargesService.resolveStatus(parsed.newStatus, parsed, charge);
            
        } catch (error: any) {
            // Loga o erro mas retorna 200 para evitar reentrega desnecessária do gateway
            this.logger.error(`Webhook processing error: ${error.message}`, error.stack);
        }
    }
}