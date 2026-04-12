import { Injectable, Logger } from '@nestjs/common';
import Client from 'src/EntityModels/Client';
import { AppointmentsQueueService } from 'src/modules/appointments/appointments-queue.service';
import { LedgerSnapshotAppointment } from 'src/modules/appointments/definitions/ledger-snapshot.appointment';
import ClientRepository from './clients.repository';
import UserDTO from '../Users/DTOs/UserDTO';

@Injectable()
export class ClientsService {
    private readonly logger = new Logger(ClientsService.name);

    constructor(
        private readonly repository: ClientRepository,
        private readonly queueService: AppointmentsQueueService,
        private readonly ledgerSnapshotAppointment: LedgerSnapshotAppointment,
    ) {}

    async createClient(user: UserDTO) {
        const client = Client.fromUser(user);
        const saved = await this.repository.saveClient(client);
        await this.scheduleLedgerSnapshot(saved.id);
        return saved;
    }

    private async scheduleLedgerSnapshot(clientId: number): Promise<void> {
        try {
            await this.queueService.schedule(this.ledgerSnapshotAppointment, clientId, { config: null });
            this.logger.log(`Agendamento ledger-snapshot criado para o cliente ${clientId}`);
        } catch (error: any) {
            this.logger.error(`Erro ao agendar ledger-snapshot para o cliente ${clientId}: ${error.message}`);
        }
    }
}
