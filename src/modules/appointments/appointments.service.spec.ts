import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsService } from './appointments.service';
import { AVAILABLE_APPOINTMENTS_TOKEN } from './appointments.constants';
import { AppointmentsQueueService } from './appointments-queue.service';
import { AuthContextService } from 'src/modules/Auth/auth-context.service';
import { ExecutableAppointment } from './executable-appointment.base';
import { Recurrence } from 'src/enum/recurrence.enum';
import { AppointmentJobData } from './types/appointment-job-data.type';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentSettingsService } from './services/appointment-settings.service';

jest.mock('./appointments-queue.service', () => ({
  AppointmentsQueueService: class {},
}));

jest.mock('./queue.provider', () => ({
  Queue: class {},
}));

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let queueService: jest.Mocked<AppointmentsQueueService>;
  let authContext: jest.Mocked<AuthContextService>;
  let settingsService: jest.Mocked<AppointmentSettingsService>;

  class SampleAppointment extends ExecutableAppointment {
    constructor() {
      super(1, 'Sample', 'Desc', Recurrence.DAILY_08, false, 'sample', null, 'America/Sao_Paulo');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(_data: AppointmentJobData): Promise<void> {
      return Promise.resolve();
    }
  }

  const appointmentInstance = new SampleAppointment();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        {
          provide: AppointmentsQueueService,
          useValue: {
            schedule: jest.fn(),
            unschedule: jest.fn(),
            isScheduled: jest.fn().mockResolvedValue(false),
            getConfig: jest.fn().mockReturnValue(null),
            remember: jest.fn(),
          },
        },
        {
          provide: AppointmentSettingsService,
          useValue: {
            findAllByClient: jest.fn().mockResolvedValue(new Map()),
            findOne: jest.fn().mockResolvedValue(null),
            upsert: jest.fn(),
          },
        },
        {
          provide: AVAILABLE_APPOINTMENTS_TOKEN,
          useValue: [appointmentInstance],
        },
        {
          provide: AuthContextService,
          useValue: { getClientId: jest.fn().mockReturnValue(42) },
        },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
    queueService = module.get(AppointmentsQueueService);
    authContext = module.get(AuthContextService);
    settingsService = module.get(AppointmentSettingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should list available appointments for the current client', async () => {
    const result = await service.listAppointments();
    expect(result.appointments).toHaveLength(1);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(queueService.isScheduled).toHaveBeenCalledWith(appointmentInstance, authContext.getClientId());
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(settingsService.findAllByClient).toHaveBeenCalledWith(authContext.getClientId());
  });

  it('should schedule appointments when enabling', async () => {
    const payload: UpdateAppointmentDto = { isActive: true };
    await service.updateStatus(1, payload);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(queueService.schedule).toHaveBeenCalledWith(appointmentInstance, authContext.getClientId(), {
      config: null,
      recurrence: appointmentInstance.recurrence,
      timezone: appointmentInstance.timezone ?? null,
    });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(settingsService.upsert).toHaveBeenCalledWith({
      appointmentType: appointmentInstance.type,
      clientId: authContext.getClientId(),
      config: null,
      isActive: true,
      recurrence: appointmentInstance.recurrence,
      timezone: appointmentInstance.timezone ?? null,
    });
  });

  it('should unschedule appointments when disabling', async () => {
    const payload: UpdateAppointmentDto = { isActive: false };
    await service.updateStatus(1, payload);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(queueService.unschedule).toHaveBeenCalledWith(appointmentInstance, authContext.getClientId());
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(settingsService.upsert).toHaveBeenCalledWith({
      appointmentType: appointmentInstance.type,
      clientId: authContext.getClientId(),
      config: null,
      isActive: false,
      recurrence: appointmentInstance.recurrence,
      timezone: appointmentInstance.timezone ?? null,
    });
  });
});
