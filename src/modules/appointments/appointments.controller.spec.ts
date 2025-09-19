import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

describe('AppointmentsController', () => {
  let controller: AppointmentsController;
  let service: jest.Mocked<AppointmentsService>;
  const appointmentsMock = { appointments: [] };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentsController],
      providers: [
        {
          provide: AppointmentsService,
          useValue: {
            listAppointments: jest.fn().mockResolvedValue(appointmentsMock),
            updateStatus: jest.fn().mockImplementation((id: number, dto: UpdateAppointmentDto) =>
              Promise.resolve({ id, ...dto, name: 'test', description: '', recurrence: 'DAILY', type: 'test' }),
            ),
          },
        },
      ],
    }).compile();

    controller = module.get<AppointmentsController>(AppointmentsController);
    service = module.get(AppointmentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should list appointments using the service', async () => {
    await expect(controller.getAppointments()).resolves.toEqual(appointmentsMock);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.listAppointments).toHaveBeenCalledTimes(1);
  });

  it('should update appointment status', async () => {
    const payload: UpdateAppointmentDto = { isActive: true };
    await controller.updateStatus(1, payload);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.updateStatus).toHaveBeenCalledWith(1, payload);
  });
});
