import { Injectable, Logger } from '@nestjs/common';
import { Recurrence } from 'src/enum/recurrence.enum';
import { LedgerBuildService } from 'src/modules/Finance/core/ledger-build/ledger-build.service';
import { ExecutableAppointment } from '../executable-appointment.base';
import { AppointmentJobData } from '../types/appointment-job-data.type';

@Injectable()
export class LedgerBuildAppointment extends ExecutableAppointment {
    private readonly logger = new Logger(LedgerBuildAppointment.name);

    constructor(private readonly ledgerBuildService: LedgerBuildService) {
        super(
            4,
            'Build do Ledger',
            'Gera o resumo financeiro consolidado do ledger para dashboards e relatórios.',
            Recurrence.DAILY_03,
            false,
            'ledger-build',
            null,
            'America/Sao_Paulo',
        );
        this.isInternal = true;
    }

    async execute(job: AppointmentJobData): Promise<void> {
        this.logger.log(`Processando ${this.type} para o cliente ${job.clientId}`);
        await this.ledgerBuildService.build();
    }
}
