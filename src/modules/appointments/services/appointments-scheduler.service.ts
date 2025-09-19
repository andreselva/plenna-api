import { Injectable, Logger } from "@nestjs/common";
import { AppointmentBase } from "../appointment.base";

type ScheduleCallback = () => Promise<boolean>;

@Injectable()
export class AppointmentsScheduler {
  private readonly logger = new Logger(AppointmentsScheduler.name);
  private readonly scheduledJobs = new Map<string, NodeJS.Timeout>();

  schedule(appointment: AppointmentBase, clientId: number, run: ScheduleCallback) {
    const jobId = appointment.buildJobId(clientId);
    this.cancel(appointment, clientId);

    const nextExecution = appointment.calculateNextExecution();
    const delay = Math.max(0, nextExecution.getTime() - Date.now());

    const timer = setTimeout(async () => {
      this.scheduledJobs.delete(jobId);
      let shouldContinue = false;

      try {
        shouldContinue = await run();
      } catch (error) {
        this.logger.error(
          `Erro ao executar o agendamento ${appointment.type} para o cliente ${clientId}.`,
          error instanceof Error ? error.stack : undefined,
        );
      }

      if (shouldContinue) {
        this.schedule(appointment, clientId, run);
      }
    }, delay);

    this.scheduledJobs.set(jobId, timer);
    this.logger.debug(
      `Agendamento ${appointment.type} programado para o cliente ${clientId} em ${nextExecution.toISOString()}.`,
    );
  }

  cancel(appointment: AppointmentBase, clientId: number) {
    const jobId = appointment.buildJobId(clientId);
    const timer = this.scheduledJobs.get(jobId);
    if (timer) {
      clearTimeout(timer);
      this.scheduledJobs.delete(jobId);
      this.logger.debug(`Agendamento ${appointment.type} cancelado para o cliente ${clientId}.`);
    }
  }
}
