import { Injectable } from "@nestjs/common";
import { BankAccount } from "src/EntityModels/BankAccount";
import { AuthContextService } from "src/modules/Auth/auth-context.service";
import MySQLDatabase from "src/modules/Config/Database/MySQLDatabase";
import BaseRepository from "src/Shared/Repositories/BaseRepository";

@Injectable()
export class BankAccountsRepository extends BaseRepository<BankAccount> {
    constructor(database: MySQLDatabase, authContext: AuthContextService) {
        super(database, authContext);
    }

    async listBankAccounts() {
        const query = `SELECT * FROM bank_accounts WHERE clientId = ? AND isActive = true`;
        const result = await this.database.select(query, [this.authContext.getClientId()]);
        return this.extractToEntity(result, BankAccount);
    }

    async inactiveBankAccount(id: number) {
        const query = `UPDATE bank_accounts SET isActive = false WHERE id = ? AND clientId = ?`;
        return await this.database.execute(query, [id, this.authContext.getClientId()]);
    }
}