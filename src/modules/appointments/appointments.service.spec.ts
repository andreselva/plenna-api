import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsService, APPOINTMENTS_TOKEN } from './appointments.service';
import { AppointmentsScheduler } from './services/appointments-scheduler.service';
import { AppointmentBase } from './appointment.base';
import { Recurrence } from 'src/enum/recurrence.enum';
import { AppointmentExecutionContext } from './interfaces/appointment-execution-context.interface';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  const scheduler = {
    schedule: jest.fn(),
    cancel: jest.fn(),
  };

  class TestAppointment extends AppointmentBase {
    constructor() {
      super(99, 'Teste', 'Agendamento de teste', Recurrence.HOURLY, false, 'test.appointment', null, 'America/Sao_Paulo');
    }

    async execute(_context: AppointmentExecutionContext): Promise<void> {
      return;
    }
  }

  const appointments = [new TestAppointment()];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        {
          provide: APPOINTMENTS_TOKEN,
          useValue: appointments,
        },
        {
          provide: AppointmentsScheduler,
          useValue: scheduler,
        },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
    scheduler.schedule.mockClear();
    scheduler.cancel.mockClear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should list available appointments', async () => {
    const result = await service.getAppointments(1);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(appointments[0].id);
  });

  it('should activate appointment and schedule execution', async () => {
    await service.updateAppointment(1, { id: appointments[0].id, isActive: true });
    expect(scheduler.schedule).toHaveBeenCalledTimes(1);
  });
});
