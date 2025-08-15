import IEntity from "src/Shared/interfaces/IEntity";
import EntityModel from "./entity.model";
import IBankAccountRow from "src/Shared/interfaces/IBankAccountRow";
import BankAccountDTO from "src/modules/Finance/BankAccounts/DTOs/BankAccountDTO";

export default class BankAccount extends EntityModel implements IEntity {
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

    public static fromEntity(entity: BankAccount) {
        const newBankAccount = new BankAccount();
        Object.assign(newBankAccount, entity);
        return newBankAccount;
    }

    public static fromDTO(dto: BankAccountDTO) {
        const bankAccount = new BankAccount();
        bankAccount.name = dto.name;
        bankAccount.generateInvoice = dto.generateInvoice;
        bankAccount.icon = dto.icon ?? '';
        bankAccount.dueDate = dto.dueDate;
        bankAccount.closingDate = dto.closingDate;
        bankAccount.id = dto.id ?? 0;
        return bankAccount;
    }

     /**
     * Método "fábrica" estático que cria uma instância de BankAccount
     * a partir de uma linha de dados crua vinda do banco de dados.
     * @param row O objeto de dados vindo da query.
     * @returns Uma nova instância de BankAccount.
     */
    public static fromRow(row: IBankAccountRow): BankAccount {
        const account = new BankAccount();
        account.id = row.id;
        account.name = row.name;
        account.icon = row.icon;
        account.generateInvoice = Boolean(row.generateInvoice);
        account.dueDate = row.dueDate;
        account.closingDate = row.closingDate;
        return account;
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