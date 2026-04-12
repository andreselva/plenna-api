import { Injectable } from '@nestjs/common';
import { Transfer } from 'src/EntityModels/Transfer';
import { AuthContextService } from 'src/modules/Auth/auth-context.service';
import MySQLDatabase from 'src/modules/Config/Database/MySQLDatabase';
import BaseRepository from 'src/Shared/Repositories/BaseRepository';

@Injectable()
export class TransfersRepository extends BaseRepository<Transfer> {
    constructor(database: MySQLDatabase, authContext: AuthContextService) {
        super(database, authContext, Transfer);
    }

    async list(): Promise<Transfer[]> {
        return await this.loadAll();
    }

    async findById(id: number): Promise<Transfer | null> {
        const rows = await this.database.select(
            `SELECT * FROM transfer WHERE id = ? AND clientId = ?`,
            [id, this.authContext.getClientId()],
        );
        return this.extractToEntity(rows)[0] ?? null;
    }

    async saveEntity(entity: Transfer): Promise<Transfer> {
        const result = await this.save(entity);
        if (result.affectedRows > 0 && entity.id === 0) {
            entity.id = result.insertId;
        }
        return entity;
    }
}
