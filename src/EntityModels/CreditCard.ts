import IEntity from "src/Shared/interfaces/IEntity";
import EntityModel from "./entity.model";
import ICreditCardRow from "src/Shared/interfaces/ICreditCardRow";
import CreditCardDTO from "src/modules/Finance/credit-cards/DTOs/credit-card.dto";

export default class CreditCard extends EntityModel implements IEntity {
    id: number = 0;
    clientId: number;
    name: string = '';
    generateInvoice: boolean = false;
    icon: string = '';
    dueDate: string = '';
    closingDate: string = '';

    constructor() {
        super();
    }

    public static fromEntity(entity: CreditCard) {
        const newCreditCard = new CreditCard();
        Object.assign(newCreditCard, entity);
        return newCreditCard;
    }

    public static fromDTO(dto: CreditCardDTO) {
        const creditCard = new CreditCard();
        creditCard.name = dto.name;
        creditCard.generateInvoice = dto.generateInvoice;
        creditCard.icon = dto.icon ?? '';
        creditCard.dueDate = dto.dueDate;
        creditCard.closingDate = dto.closingDate;
        creditCard.id = dto.id ?? 0;
        return creditCard;
    }

     /**
     * Método "fábrica" estático que cria uma instância de CreditCard
     * a partir de uma linha de dados crua vinda do banco de dados.
     * @param row O objeto de dados vindo da query.
     * @returns Uma nova instância de CreditCard.
     */
    public static fromRow(row: ICreditCardRow): CreditCard {
        const creditCard = new CreditCard();
        creditCard.id = row.id;
        creditCard.name = row.name;
        creditCard.icon = row.icon;
        creditCard.generateInvoice = Boolean(row.generateInvoice);
        creditCard.dueDate = row.dueDate;
        creditCard.closingDate = row.closingDate;
        return creditCard;
    }

    public getTableName(): string {
        return 'bank_account';
    }

    public getPrimaryKey(): string {
        return 'id';
    }

    public getIgnoredProperties(): string[] {
        return [];
    }
}