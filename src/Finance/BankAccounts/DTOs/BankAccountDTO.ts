export default class BankAccountDTO {
    name: string;
    generateInvoice: boolean;
    dueDate?: string = "";
    closingDate?: string = "";
    icon?: string = "";
}