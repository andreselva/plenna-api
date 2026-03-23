import CreditCard from "src/EntityModels/CreditCard";
import { BaseScript } from "../core/BaseScript";
import { IScript } from "../core/IScript";

export class MigraDadosCreditCardsScript extends BaseScript implements IScript {
  async execute(): Promise<void> {
    const oldBankAccounts = await this.query(
      `SELECT * FROM bank_account`,
      [],
    );

    if (oldBankAccounts.length > 0) {
        console.log(`${oldBankAccounts.length} registros encontrados para migração`)
        const newCreditCards: CreditCard[] = oldBankAccounts.map(oba => {
            const creditCard = new CreditCard();
            creditCard.id = oba.id;
            creditCard.name = oba.name;
            creditCard.generateInvoice = oba.generateInvoice;
            creditCard.dueDate = oba.dueDate;
            creditCard.closingDate = oba.closingDate;
            creditCard.clientId = oba.clientId;
            return creditCard;
        });

        newCreditCards.forEach(cc => {
          console.log(`inserindo ${JSON.stringify(cc)} na credit_cards.`)
          this.executeSQL(
            `INSERT INTO credit_cards (id, name, generateInvoice, dueDate, closingDate, clientId) VALUES (?, ?, ?, ?, ?, ?)`,
            [cc.id, cc.name, cc.generateInvoice, cc.dueDate, cc.closingDate, cc.clientId]
          )
        })
    }
  }
}