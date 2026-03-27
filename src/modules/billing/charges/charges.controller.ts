import { Body, Controller, Post } from '@nestjs/common';
import { create } from 'domain';
import { CreateChargeDto } from './dtos/create-charge.dto';

@Controller('charges')
export class ChargesController {
    @Post('/create')
    async createCharge(@Body() dto: CreateChargeDto) {
        
    }
}
