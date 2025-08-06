import { Injectable } from "@nestjs/common";
import BankAccountsRepository from "../BankAccountsRepository";
import BankAccount from "../../../EntityModels/BankAccount";
import BankAccountDTO from "../DTOs/BankAccountDTO";

@Injectable()
export default class CreateBankAccount {
    constructor(
        private readonly repository: BankAccountsRepository
    ) { }

    async execute(bankAccount: BankAccountDTO): Promise<{ bankAccount: BankAccount }> {
        const entity = new BankAccount();
        entity.name = bankAccount.name;
        entity.generateInvoice = Boolean(bankAccount.generateInvoice);
        entity.dueDate = bankAccount.dueDate;
        entity.closingDate = bankAccount.closingDate;
        entity.icon = bankAccount.icon !== undefined ? bankAccount.icon : '';

        if (bankAccount.id !== undefined && bankAccount.id > 0) {
            entity.id = bankAccount.id;
        }

        const createdBankAccount = await this.repository.saveBankAccount(entity);
        return { bankAccount: createdBankAccount };
    }
}