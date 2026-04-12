import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AVAILABLE_APPOINTMENTS_TOKEN } from 'src/modules/appointments/appointments.constants';
import { AppointmentsQueueService } from 'src/modules/appointments/appointments-queue.service';
import { ExecutableAppointment } from 'src/modules/appointments/executable-appointment.base';
import { LedgerBuildRepository } from 'src/modules/Finance/core/ledger-build/ledger-build.repository';

@Injectable()
export class LedgerBuildInitializer implements OnModuleInit {
    private readonly logger = new Logger(LedgerBuildInitializer.name);

    constructor(
        @Inject(AVAILABLE_APPOINTMENTS_TOKEN)
        private readonly appointments: ExecutableAppointment[],
        private readonly queueService: AppointmentsQueueService,
        private readonly buildRepository: LedgerBuildRepository,
    ) {}

    async onModuleInit(): Promise<void> {
        const appointment = this.appointments.find((a) => a.type === 'ledger-build');
        if (!appointment) return;

        const clientIds = await this.buildRepository.getAllActiveClientIds();
        this.logger.log(`Inicializando agendamento de ledger-build para ${clientIds.length} cliente(s)`);

        for (const clientId of clientIds) {
            const isScheduled = await this.queueService.isScheduled(appointment, clientId);
            if (!isScheduled) {
                await this.queueService.schedule(appointment, clientId, { config: null });
                this.logger.log(`Agendamento ledger-build criado para o cliente ${clientId}`);
            }
        }
    }
}
