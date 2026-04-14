import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AVAILABLE_APPOINTMENTS_TOKEN } from 'src/modules/appointments/appointments.constants';
import { AppointmentsQueueService } from 'src/modules/appointments/appointments-queue.service';
import { ExecutableAppointment } from 'src/modules/appointments/executable-appointment.base';
import { LedgerSnapshotRepository } from 'src/modules/Finance/core/ledger/ledger-snapshot.repository';
import { AppointmentsEnum } from 'src/enum/appointments.enum';

@Injectable()
export class LedgerSnapshotInitializer implements OnModuleInit {
    private readonly logger = new Logger(LedgerSnapshotInitializer.name);

    constructor(
        @Inject(AVAILABLE_APPOINTMENTS_TOKEN)
        private readonly appointments: ExecutableAppointment[],
        private readonly queueService: AppointmentsQueueService,
        private readonly snapshotRepository: LedgerSnapshotRepository,
    ) {}

    async onModuleInit(): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
        const appointment = this.appointments.find((a) => a.type === AppointmentsEnum.LEDGER_SNAPSHOT);
        if (!appointment) return;

        const clientIds = await this.snapshotRepository.getAllActiveClientIds();
        this.logger.log(`Inicializando agendamento de snapshot para ${clientIds.length} cliente(s)`);

        for (const clientId of clientIds) {
            const isScheduled = await this.queueService.isScheduled(appointment, clientId);
            if (!isScheduled) {
                await this.queueService.schedule(appointment, clientId, { config: null });
                this.logger.log(`Agendamento ledger-snapshot criado para o cliente ${clientId}`);
            }
        }
    }
}
