import { Injectable } from "@nestjs/common";
import CreditCardDTO from "./DTOs/credit-card.dto";
import CreditCardsRepository from "./credit-cards.repository";
import CreditCard from "src/EntityModels/CreditCard";

@Injectable()
export default class CreditCardsService {
    constructor(
        private readonly repository: CreditCardsRepository
    ) {}

    async getCreditCards() {
        const bankAccounts = await this.repository.getCreditCards();
        return { bankAccounts: bankAccounts };
    }

    async createCreditCard(bankAccount: CreditCardDTO) {
        const entity = CreditCard.fromDTO(bankAccount);
        const createdBankAccount = await this.repository.saveCreditCard(entity);
        return { bankAccount: createdBankAccount };
    }

    async deleteCreditCard(id: string) {
        if (!id) {
            throw new Error("ID is required to delete a bank account.");
        }
        return await this.repository.deleteBankAccount(Number(id));
    }

    async updateCreditCard(id: string, bankAccount: CreditCardDTO) {
        bankAccount.id = Number(id);
        const entity = CreditCard.fromDTO(bankAccount);
        const updatedBankAccount = await this.repository.saveCreditCard(entity);
        return { bankAccount: updatedBankAccount };
    }
}