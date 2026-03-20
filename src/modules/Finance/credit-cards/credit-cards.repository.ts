import { Injectable } from "@nestjs/common";
import CreditCard from "src/EntityModels/CreditCard";
import { AuthContextService } from "src/modules/Auth/auth-context.service";
import MySQLDatabase from "src/modules/Config/Database/MySQLDatabase";
import BaseRepository from "src/Shared/Repositories/BaseRepository";

@Injectable()
export default class CreditCardsRepository extends BaseRepository<CreditCard>{
    constructor(database: MySQLDatabase, authContext: AuthContextService) { 
        super(database, authContext)
    }

    async getCreditCards(): Promise<CreditCard[]> {
        const query = "SELECT * FROM credit_cards WHERE clientId = ?";
        const rows = await this.database.select(query, [this.authContext.getClientId()]);
        return this.extractToEntity(rows, CreditCard);
    }

    async saveCreditCard(entity: CreditCard): Promise<CreditCard> {
        entity.clientId = this.authContext.getClientId();
        const result = await this.save(entity);
        if (result.affectedRows > 0 && entity.id === 0) {
            entity.id = result.insertId;
        }
        return entity;
    }

    async deleteBankAccount(id: number) {
        const query = "DELETE FROM credit_cards WHERE clientId = ? AND id = ?";
        const result = await this.database.execute(query, [this.authContext.getClientId(), id]);

        if (result.affectedRows > 0) {
            return { success: true, message: 'Conta deletada com sucesso.' };
        }
        throw new Error("Failed to delete bank account");
    }
}