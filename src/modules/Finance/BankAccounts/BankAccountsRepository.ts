import { Injectable } from "@nestjs/common";
import { AuthContextService } from "src/modules/Auth/auth-context.service";
import MySQLDatabase from "src/modules/Config/Database/MySQLDatabase";
import BankAccount from "src/EntityModels/BankAccount";
import BaseRepository from "src/Shared/Repositories/BaseRepository";

@Injectable()
export default class BankAccountsRepository extends BaseRepository<BankAccount>{
    constructor(database: MySQLDatabase, authContext: AuthContextService) { 
        super(database, authContext)
    }

    async getBankAccounts(): Promise<BankAccount[]> {
        const query = "SELECT * FROM bank_account WHERE clientId = ?";
        const rows = await this.database.select(query, [this.authContext.getClientId()]);
        return this.extractToEntity(rows, BankAccount);
    }

    async saveBankAccount(bankAccount: BankAccount): Promise<BankAccount> {
        bankAccount.clientId = this.authContext.getClientId();
        const result = await this.save(bankAccount);
        if (result.affectedRows > 0 && bankAccount.id === 0) {
            bankAccount.id = result.insertId;
        }
        return bankAccount;
    }

    async deleteBankAccount(id: number) {
        const query = "DELETE FROM bank_account WHERE clientId = ? AND id = ?";
        const result = await this.database.execute(query, [this.authContext.getClientId(), id]);

        if (result.affectedRows > 0) {
            return { success: true, message: 'Conta deletada com sucesso.' };
        }
        throw new Error("Failed to delete bank account");
    }
}