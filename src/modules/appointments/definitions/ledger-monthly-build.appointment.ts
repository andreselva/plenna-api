import { Injectable, Logger } from '@nestjs/common';
import { Recurrence } from 'src/enum/recurrence.enum';
import { AppointmentsEnum } from 'src/enum/appointments.enum';
import { LedgerMonthlyBuildService } from 'src/modules/Finance/core/ledger-monthly-build/ledger-monthly-build.service';
import { ExecutableAppointment } from '../executable-appointment.base';
import { AppointmentJobData } from '../types/appointment-job-data.type';

@Injectable()
export class LedgerMonthlyBuildAppointment extends ExecutableAppointment {
    private readonly logger = new Logger(LedgerMonthlyBuildAppointment.name);

    constructor(private readonly ledgerMonthlyBuildService: LedgerMonthlyBuildService) {
        super(
            5,
            'Monthly Build do Ledger',
            'Gera o resumo financeiro mensal consolidado do ledger com filtro de período para dashboards e relatórios históricos.',
            Recurrence.DAILY_03,
            false,
            AppointmentsEnum.LEDGER_MONTHLY_BUILD,
            null,
            'America/Sao_Paulo',
        );
        this.isInternal = true;
    }

    async execute(job: AppointmentJobData): Promise<void> {
        this.logger.log(`Processando ${this.type} para o cliente ${job.clientId}`);
        await this.ledgerMonthlyBuildService.build();
    }
}
