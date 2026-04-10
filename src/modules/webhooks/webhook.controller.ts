import { Body, Controller, Headers, Inject, Param, Post } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { WebhookService } from './webhook.service';

@Controller('webhooks/handle')
export class WebhookController {

    constructor(
        private readonly service: WebhookService,
        @Inject(REQUEST) private readonly request: any,
    ) {}

    @Post(':gateway')
    async handleWebhook(
        @Param('gateway') gateway: string,
        @Body() payload: unknown,
        @Headers() headers: Record<string, string>,
    ) {
        await this.service.handleWebhook(gateway, payload, headers, this.request);
        return { received: true };
    }
}
