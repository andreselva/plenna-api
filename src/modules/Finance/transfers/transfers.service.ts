import { Injectable } from '@nestjs/common';
import { Transfer } from 'src/EntityModels/Transfer';
import { TransferDTO } from './DTOs/transfer.dto';
import { TransfersRepository } from './transfers.repository';

@Injectable()
export class TransfersService {
    constructor(
        private readonly repository: TransfersRepository,
    ) {}

    async list() {
        const transfers = await this.repository.list();
        return { transfers };
    }

    async create(dto: TransferDTO) {
        const entity = Transfer.fromDTO(dto);
        return await this.repository.saveEntity(entity);
    }

    async update(id: number, dto: TransferDTO) {
        dto.id = id;
        const entity = Transfer.fromDTO(dto);
        return await this.repository.saveEntity(entity);
    }
}
