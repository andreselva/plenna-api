import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AVAILABLE_APPOINTMENTS_TOKEN } from 'src/modules/appointments/appointments.constants';
import { AppointmentsQueueService } from 'src/modules/appointments/appointments-queue.service';
import { ExecutableAppointment } from 'src/modules/appointments/executable-appointment.base';
import { LedgerSnapshotRepository } from 'src/modules/Finance/core/ledger/ledger-snapshot.repository';

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
        const appointment = this.appointments.find((a) => a.type === 'ledger-snapshot');
        if (!appointment) return;

        const clientIds = await this.snapshotRepository.getAllClientIds();
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
