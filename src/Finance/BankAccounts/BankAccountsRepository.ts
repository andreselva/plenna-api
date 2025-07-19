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
            generateInvoice: Boolean(row.generateInvoice),
            dueDate: row.dueDate,
            closingDate: row.closingDate
        }));
    }

    async createBankAccount(bankAccount: BankAccount): Promise<BankAccountResponseDTO> {
        const params = [
            bankAccount.getName(),
            bankAccount.getIcon(),
            bankAccount.getGenerateInvoice(),
            bankAccount.getDueDate(),
            bankAccount.getClosingDate()
        ];
        const placeholders = QueryBuilder.getPlaceholders(params);
        const query = `INSERT INTO bank_account (name, icon, gerenateInvoice) VALUES (${placeholders})`;
        const result = await this.database.execute(query, params);

        if (result.affectedRows > 0) {
            return new BankAccountResponseDTO(
                result.insertId,
                bankAccount.getName(),
                bankAccount.getGenerateInvoice(),
                bankAccount.getIcon(),
                bankAccount.getDueDate(),
                bankAccount.getClosingDate(),
            );
        }
        throw new Error("Failed to create bank account");
    }

    async deleteBankAccount(id: number): Promise<{ message: string }> {
        const query = "DELETE FROM bank_account WHERE id = ?";
        const result = await this.database.execute(query, [id]);

        if (result.affectedRows > 0) {
            return { message: "Bank account deleted successfully" };
        }
        throw new Error("Failed to delete bank account");
    }

    async updateBankAccount(bankAccount: BankAccount): Promise<BankAccountResponseDTO> {
        const id = bankAccount.getId();
        if (id === undefined) {
            throw new Error("Bank account ID is required for update");
        }

        const query = "UPDATE bank_account SET name = ?, icon = ?, generateInvoice = ?, dueDate = ?, closingDate = ? WHERE id = ?";
        const params = [
            bankAccount.getName(),
            bankAccount.getIcon() || "",
            bankAccount.getGenerateInvoice(),
            bankAccount.getDueDate(),
            bankAccount.getClosingDate(),
            id
        ];
        const result = await this.database.execute(query, params);
        if (result.affectedRows > 0) {
            return new BankAccountResponseDTO(
                id,
                bankAccount.getName(),
                bankAccount.getGenerateInvoice(),
                bankAccount.getIcon(),
                bankAccount.getDueDate(),
                bankAccount.getClosingDate()
            );
        }
        throw new Error("Failed to update bank account");
    }

}