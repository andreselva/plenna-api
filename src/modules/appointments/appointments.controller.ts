import { Body, Controller, Get, Put } from '@nestjs/common';
import { get } from 'http';

@Controller('appointments')
export class AppointmentsController {

    @Get()
    async getAppointments() {
        return { appointments: [
            {
                id: 1,
                name: 'Envio de e-mail para contas com vencimento próximo',
                description: 'Notifica clientes/usuários sobre vencimentos próximos.',
                isActive: false,
                recurrence: 'hourly'
            }
        ]}
    }

    @Put()
    async enableAppointment(@Body() appointment: any) {
        if (appointment) {
            return await this.getAppointments();
        }
        return false;
    }

}
