import { Body, Controller, Get, Put, UnauthorizedException } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AuthContextService } from 'src/modules/Auth/auth-context.service';

@Controller('appointments')
export class AppointmentsController {

    constructor(
        private readonly appointmentsService: AppointmentsService,
        private readonly authContext: AuthContextService,
    ) {}

    @Get()
    async getAppointments() {
        const clientId = this.authContext.getClientId();
        if (!clientId) {
            throw new UnauthorizedException('Cliente não identificado para buscar agendamentos.');
        }
        const appointments = await this.appointmentsService.getAppointments(clientId);
        return { appointments };
    }

    @Put()
    async enableAppointment(@Body() appointment: UpdateAppointmentDto) {
        const clientId = this.authContext.getClientId();
        if (!clientId) {
            throw new UnauthorizedException('Cliente não identificado para atualizar agendamentos.');
        }
        await this.appointmentsService.updateAppointment(clientId, appointment);
        const appointments = await this.appointmentsService.getAppointments(clientId);
        return { appointments };
    }

}
