import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AppointmentsEnum } from 'src/enum/appointments.enum';
import { AVAILABLE_APPOINTMENTS_TOKEN } from 'src/modules/appointments/appointments.constants';
import { AppointmentsQueueService } from 'src/modules/appointments/appointments-queue.service';
import { ExecutableAppointment } from 'src/modules/appointments/executable-appointment.base';
import { LedgerMonthlyBuildRepository } from 'src/modules/Finance/core/ledger-monthly-build/ledger-monthly-build.repository';

@Injectable()
export class LedgerMonthlyBuildInitializer implements OnModuleInit {
    private readonly logger = new Logger(LedgerMonthlyBuildInitializer.name);

    constructor(
        @Inject(AVAILABLE_APPOINTMENTS_TOKEN)
        private readonly appointments: ExecutableAppointment[],
        private readonly queueService: AppointmentsQueueService,
        private readonly buildRepository: LedgerMonthlyBuildRepository,
    ) {}

    async onModuleInit(): Promise<void> {
        const appointment = this.appointments.find((a) => a.type === AppointmentsEnum.LEDGER_MONTHLY_BUILD);
        if (!appointment) return;

        const clientIds = await this.buildRepository.getActiveClientIds();
        this.logger.log(`Inicializando agendamento de ledger-monthly-build para ${clientIds.length} cliente(s)`);

        for (const clientId of clientIds) {
            const isScheduled = await this.queueService.isScheduled(appointment, clientId);
            if (!isScheduled) {
                await this.queueService.schedule(appointment, clientId, { config: null });
                this.logger.log(`Agendamento ledger-monthly-build criado para o cliente ${clientId}`);
            }
        }
    }
}
