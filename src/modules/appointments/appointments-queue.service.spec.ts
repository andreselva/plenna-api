import { Queue } from 'bullmq';
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
    const queueMock = {
      add: jest.fn().mockResolvedValue(undefined),
      getRepeatableJobs: jest.fn().mockResolvedValue([repeatableJob]),
      removeRepeatable: jest.fn(),
      removeRepeatableByKey: jest.fn().mockResolvedValue(undefined),
      remove: jest.fn().mockResolvedValue(undefined),
    };

    const queue = queueMock as unknown as Queue<AppointmentJobData<unknown>>;
    const service = new AppointmentsQueueService(queue);

    await service.schedule(appointment, clientId, {
      config: null,
      recurrence: Recurrence.DAILY_08,
      timezone: 'America/Sao_Paulo',
    });

    expect(queueMock.removeRepeatableByKey).toHaveBeenCalledWith(repeatableJob.key);
    expect(queueMock.remove).toHaveBeenCalledWith(jobId);
    expect(queueMock.add).toHaveBeenCalledWith(
      appointment.type,
      expect.objectContaining({ appointmentId: appointment.id, clientId }),
      expect.objectContaining({ jobId }),
    );
  });

  it('usa removeRepeatable quando removeRepeatableByKey não está disponível', async () => {
    const queueMock = {
      add: jest.fn().mockResolvedValue(undefined),
      getRepeatableJobs: jest.fn().mockResolvedValue([repeatableJob]),
      removeRepeatable: jest.fn().mockResolvedValue(undefined),
      remove: jest.fn().mockResolvedValue(undefined),
    };

    const queue = queueMock as unknown as Queue<AppointmentJobData<unknown>>;
    const service = new AppointmentsQueueService(queue);

    await service.unschedule(appointment, clientId);

    expect(queueMock.removeRepeatable).toHaveBeenCalledWith(
      appointment.type,
      expect.objectContaining({ pattern: '0 8 * * *' }),
      jobId,
    );
    expect(queueMock.remove).toHaveBeenCalledWith(jobId);
  });
});