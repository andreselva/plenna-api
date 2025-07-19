import { Injectable } from "@nestjs/common";
import BankAccountsRepository from "../BankAccountsRepository";
import BankAccountDTO from "../DTOs/BankAccountDTO";
import BankAccount from "../Entity/BankAccount";

@Injectable()
export default class UpdateBankAccount {
    constructor(
        private readonly repository: BankAccountsRepository
    ) { }

    async execute(id: string, bankAccount: BankAccountDTO) {
        if (!id) {
            throw new Error("ID is required to update a bank account.");
        }

        if (!bankAccount.icon) {
            bankAccount.icon = "";
        }

        if (!bankAccount.dueDate) {
            bankAccount.dueDate = "";
        }

        if (!bankAccount.closingDate) {
            bankAccount.closingDate = "";
        }

        const entity = new BankAccount(
            bankAccount.name,
            Boolean(bankAccount.generateInvoice),
            bankAccount.icon,
            bankAccount.dueDate,
            bankAccount.closingDate,
            Number(id)
        );
        return await this.repository.updateBankAccount(entity);
    }
}