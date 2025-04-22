import MySQLDatabase from "src/Config/Database/MySQLDatabase";
import BankAccountsRowDTO from "./DTOs/BankAccountsRowDTO";
import BankAccount from "./Entity/BankAccount";
import BankAccountResponseDTO from "./DTOs/BankAccountResponseDTO";
import { Injectable } from "@nestjs/common";
import QueryBuilder from "src/Shared/QueryBuilder/QueryBuilder";

@Injectable()
export default class BankAccountsRepository {
    constructor(
        private readonly database: MySQLDatabase
    ) { }

    async getBankAccounts(): Promise<BankAccountsRowDTO[]> {
        const query = "SELECT * FROM bank_account";
        const rows = await this.database.select(query) as BankAccountsRowDTO[];
        return rows.map(row => ({
            id: row.id,
            name: row.name,
            icon: row.icon,
        }));
    }

    async createBankAccount(bankAccount: BankAccount): Promise<BankAccountResponseDTO> {
        const params = [
            bankAccount.getName(),
            bankAccount.getIcon() || ""
        ];
        const placeholders = QueryBuilder.getPlaceholders(params);
        const query = `INSERT INTO bank_account (name, icon) VALUES (${placeholders})`;
        const result = await this.database.execute(query, params);

        if (result.affectedRows > 0) {
            return new BankAccountResponseDTO(
                result.insertId,
                bankAccount.getName(),
                bankAccount.getIcon()
            );
        }
        throw new Error("Failed to create bank account");
    }

}