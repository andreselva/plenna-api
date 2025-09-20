import { AppointmentsQueueService } from './appointments-queue.service';
import { ExecutableAppointment } from './executable-appointment.base';
import { Recurrence } from 'src/enum/recurrence.enum';
import { AppointmentJobData } from './types/appointment-job-data.type';

class SampleAppointment extends ExecutableAppointment {
  constructor() {
    super(1, 'Sample', 'Descrição', Recurrence.DAILY_08, true, 'sample', null, 'America/Sao_Paulo');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execute(_data: AppointmentJobData): Promise<void> {
    return Promise.resolve();
  }
}

describe('AppointmentsQueueService', () => {
  const clientId = 42;
  const appointment = new SampleAppointment();
  const jobId = appointment.buildJobId(clientId);
  const repeatableJob = {
    id: jobId,
    key: jobId,
    name: appointment.type,
    next: null as number | null,
  };

  it('remove agendamentos existentes antes de registrar um novo', async () => {
    const queue = {
      add: jest.fn().mockResolvedValue(undefined),
      getRepeatableJobs: jest.fn().mockResolvedValue([repeatableJob]),
      removeRepeatable: jest.fn(),
      removeRepeatableByKey: jest.fn().mockResolvedValue(undefined),
      remove: jest.fn().mockResolvedValue(undefined),
    };

    const service = new AppointmentsQueueService(queue as any);

    await service.schedule(appointment, clientId, {
      config: null,
      recurrence: Recurrence.DAILY_08,
      timezone: 'America/Sao_Paulo',
    });

    expect(queue.removeRepeatableByKey).toHaveBeenCalledWith(repeatableJob.key);
    expect(queue.remove).toHaveBeenCalledWith(jobId);
    expect(queue.add).toHaveBeenCalledWith(
      appointment.type,
      expect.objectContaining({ appointmentId: appointment.id, clientId }),
      expect.objectContaining({ jobId }),
    );
  });

  it('usa removeRepeatable quando removeRepeatableByKey não está disponível', async () => {
    const queue = {
      add: jest.fn().mockResolvedValue(undefined),
      getRepeatableJobs: jest.fn().mockResolvedValue([repeatableJob]),
      removeRepeatable: jest.fn().mockResolvedValue(undefined),
      remove: jest.fn().mockResolvedValue(undefined),
    };

    const service = new AppointmentsQueueService(queue as any);

    await service.unschedule(appointment, clientId);

    expect(queue.removeRepeatable).toHaveBeenCalledWith(
      appointment.type,
      expect.objectContaining({ pattern: '0 8 * * *' }),
      jobId,
    );
    expect(queue.remove).toHaveBeenCalledWith(jobId);
  });
});
