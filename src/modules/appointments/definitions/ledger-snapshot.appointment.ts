import { Injectable, Logger } from '@nestjs/common';
import { Recurrence } from 'src/enum/recurrence.enum';
import { LedgerSnapshotService } from 'src/modules/Finance/core/ledger/ledger-snapshot.service';
import { ExecutableAppointment } from '../executable-appointment.base';
import { AppointmentJobData } from '../types/appointment-job-data.type';
import { AppointmentsEnum } from 'src/enum/appointments.enum';

@Injectable()
export class LedgerSnapshotAppointment extends ExecutableAppointment {
    private readonly logger = new Logger(LedgerSnapshotAppointment.name);

    constructor(private readonly snapshotService: LedgerSnapshotService) {
        super(
            3,
            'Snapshot do Ledger',
            'Gera snapshots periódicos do saldo do ledger por conta bancária.',
            Recurrence.DAILY_08,
            false,
            AppointmentsEnum.LEDGER_SNAPSHOT,
            null,
            'America/Sao_Paulo',
        );
        this.isInternal = true;
    }

    async execute(job: AppointmentJobData): Promise<void> {
        this.logger.log(`Processando ${this.type} para o cliente ${job.clientId}`);
        await this.snapshotService.generateForClient();
    }
}
