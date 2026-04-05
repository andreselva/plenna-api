import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateChargeDto } from './dtos/create-charge.dto';
import { ChargesService } from './charges.service';

@Controller('charges')
export class ChargesController {
    constructor(
        private readonly service: ChargesService
    ) {}

    @Post('/create')
    async createCharge(@Body() dto: CreateChargeDto) {
        return await this.service.create(dto);
    }

    @Get()
    async getCharges() {
        return await this.service.getCharges();
    }

    @Get('/:id/history')
    async getHistory(@Param('id') id: number) {
        return await this. service.getHistory(id);
    }
}
