import { Injectable, Logger } from '@nestjs/common';
import { Recurrence } from 'src/enum/recurrence.enum';
import { ChargeExpirationService } from 'src/modules/billing/charges/expiration/charge-expiration.service';
import { ExecutableAppointment } from '../executable-appointment.base';
import { AppointmentJobData } from '../types/appointment-job-data.type';

@Injectable()
export class ChargeExpirationAppointment extends ExecutableAppointment {
    private readonly logger = new Logger(ChargeExpirationAppointment.name);

    constructor(private readonly expirationService: ChargeExpirationService) {
        super(
            2,
            'Expiração de cobranças',
            'Expira cobranças em AWAITING_PAYMENT que ultrapassaram o prazo de pagamento.',
            Recurrence.HOURLY,
            true,
            'charge-expiration',
            null,
            'America/Sao_Paulo',
        );
    }

    async execute(job: AppointmentJobData): Promise<void> {
        this.logger.log(`Executando job de expiração de cobranças`);

        const expired = await this.expirationService.findExpired();
        this.logger.log(`${expired.length} cobrança(s) para expirar`);

        for (const charge of expired) {
            try {
                await this.expirationService.expireCharge(charge);
                this.logger.log(`Charge ${charge.id} expirada`);
            } catch (error: any) {
                this.logger.error(`Erro ao expirar charge ${charge.id}: ${error.message}`);
            }
        }
    }
}
