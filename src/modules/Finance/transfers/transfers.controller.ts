import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { TransferDTO } from './DTOs/transfer.dto';
import { TransfersService } from './transfers.service';

@Controller('transfers')
export class TransfersController {
    constructor(
        private readonly service: TransfersService,
    ) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    async list() {
        return await this.service.list();
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: TransferDTO) {
        return await this.service.create(dto);
    }

    @Post('/revert')
    async revertTransfer(@Body() transfer: TransferDTO) {
        return await this.service.revertTransfer(transfer)
    }
}
