import MySQLDatabase from "src/Config/Database/MySQLDatabase";
import BankAccount from "../../EntityModels/BankAccount";
import { Injectable } from "@nestjs/common";
import BaseRepository from "src/Shared/Repositories/BaseRepository";

@Injectable()
export default class BankAccountsRepository extends BaseRepository<BankAccount>{
    constructor(database: MySQLDatabase) { 
        super(database)
    }

    async getBankAccounts(): Promise<BankAccount[]> {
        const query = "SELECT * FROM bank_account";
        const rows = await this.database.select(query);
        return this.extractToEntity(rows, BankAccount);
    }

    async saveBankAccount(bankAccount: BankAccount): Promise<BankAccount> {
        try {
            const result = await this.save(bankAccount);
            if (result.affectedRows > 0 && bankAccount.id === 0) {
                bankAccount.id = result.insertId;
                return bankAccount;
            }
            return bankAccount;
        } catch {
            throw new Error("Failed to create bank account");
        }
    }

    async deleteBankAccount(id: number) {
        const query = "DELETE FROM bank_account WHERE id = ?";
        const result = await this.database.execute(query, [id]);

        if (result.affectedRows > 0) {
            return { success: true, message: 'Conta deletada com sucesso.' };
        }
        throw new Error("Failed to delete bank account");
    }
}