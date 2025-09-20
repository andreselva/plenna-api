import { Body, Controller, Get, Param, ParseIntPipe, Put } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Controller('appointments')
export class AppointmentsController {

    constructor(private readonly appointmentsService: AppointmentsService) {}

    @Get()
    getAppointments() {
        return this.appointmentsService.listAppointments();
    }

    @Put(':id/status')
    async updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() payload: UpdateAppointmentDto,
    ) {
        return this.appointmentsService.updateStatus(id, payload);
    }

}
