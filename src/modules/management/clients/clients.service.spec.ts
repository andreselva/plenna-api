import { Test, TestingModule } from '@nestjs/testing';
import { ClientsService } from './clients.service';
import ClientRepository from './clients.repository';
import { AppointmentsQueueService } from 'src/modules/appointments/appointments-queue.service';
import { LedgerSnapshotAppointment } from 'src/modules/appointments/definitions/ledger-snapshot.appointment';

describe('ClientsService', () => {
  let service: ClientsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        {
          provide: ClientRepository,
          useValue: {
            saveClient: jest.fn(),
          },
        },
        {
          provide: AppointmentsQueueService,
          useValue: {
            schedule: jest.fn(),
          },
        },
        {
          provide: LedgerSnapshotAppointment,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});