import { Injectable, Logger } from '@nestjs/common';
import { Recurrence } from 'src/enum/recurrence.enum';
import { ChargesService } from 'src/modules/billing/charges/charges.service';
import { ExecutableAppointment } from '../executable-appointment.base';
import { AppointmentJobData } from '../types/appointment-job-data.type';
import { AppointmentsEnum } from 'src/enum/appointments.enum';


@Injectable()
export class ChargeExpirationAppointment extends ExecutableAppointment {
    private readonly logger = new Logger(ChargeExpirationAppointment.name);

    constructor(private readonly chargeService: ChargesService) {
        super(
            2,
            'Expiração de cobranças',
            'Expira cobranças em "Aguardando pagamento" que ultrapassaram o prazo de pagamento.',
            Recurrence.HOURLY,
            false,
            AppointmentsEnum.CHARGE_EXPIRATION,
            null,
            'America/Sao_Paulo',
        );
    }

    async execute(job: AppointmentJobData): Promise<void> {
        this.logger.log(`Processando agendamento ${this.type} para o cliente ${job.clientId}`);

        const expired = await this.chargeService.getExpiredCharges();
        this.logger.log(`${expired.length} cobrança(s) para expirar`);

        for (const charge of expired) {
            try {
                await this.chargeService.expire(charge.id);
                this.logger.log(`Charge ${charge.id} expirada`);
            } catch (error: any) {
                this.logger.error(`Erro ao expirar charge ${charge.id}: ${error.message}`);
            }
        }
    }
}
