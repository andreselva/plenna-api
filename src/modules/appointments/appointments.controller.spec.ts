import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { AuthContextService } from '../Auth/auth-context.service';

describe('AppointmentsController', () => {
  let controller: AppointmentsController;
  const appointmentsService = {
    getAppointments: jest.fn(),
    updateAppointment: jest.fn(),
  };
  const authContext = {
    getClientId: jest.fn().mockReturnValue(1),
  };

  beforeEach(async () => {
    appointmentsService.getAppointments.mockResolvedValue([{ id: 1 }]);
    appointmentsService.updateAppointment.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentsController],
      providers: [
        { provide: AppointmentsService, useValue: appointmentsService },
        { provide: AuthContextService, useValue: authContext },
      ],
    }).compile();

    controller = module.get<AppointmentsController>(AppointmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should list appointments for current client', async () => {
    const result = await controller.getAppointments();
    expect(result.appointments).toBeDefined();
    expect(appointmentsService.getAppointments).toHaveBeenCalledWith(1);
  });

  it('should update appointment and return updated list', async () => {
    const payload = { id: 1, isActive: true } as any;
    const result = await controller.enableAppointment(payload);
    expect(appointmentsService.updateAppointment).toHaveBeenCalledWith(1, payload);
    expect(result.appointments).toBeDefined();
  });
});
