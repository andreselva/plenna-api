import { Module } from "@nestjs/common";
import { WebhookController } from "./webhook.controller";
import { ChargesModule } from "../billing/charges/charges.module";
import { GatewaysIntegrationsModule } from "../integrations/gateways/gateways-integrations.module";

@Module({
  imports: [ChargesModule, GatewaysIntegrationsModule],
  providers: [],
  controllers: [WebhookController]
})

export class WebhookModule {}