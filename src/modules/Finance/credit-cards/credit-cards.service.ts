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
        const creditCards = await this.repository.getCreditCards();
        return { creditCards: creditCards };
    }

    async createCreditCard(bankAccount: CreditCardDTO) {
        const entity = CreditCard.fromDTO(bankAccount);
        const createdCreditCard = await this.repository.saveCreditCard(entity);
        return { creditCard: createdCreditCard };
    }

    async deleteCreditCard(id: string) {
        if (!id) {
            throw new Error("ID is required to delete a bank account.");
        }
        return await this.repository.deleteBankAccount(Number(id));
    }

    async updateCreditCard(id: string, creditCard: CreditCardDTO) {
        creditCard.id = Number(id);
        const entity = CreditCard.fromDTO(creditCard);
        const updatedCreditCard = await this.repository.saveCreditCard(entity);
        return { creditCard: updatedCreditCard };
    }
}