import { Expense } from "src/Finance/Expenses/Entity/Expense";

export default class Invoice {
    private closingDate: string;
    private dueDate: string;
    private idBankAccount: number;
    private name: string;
    private id?: number;
    private status?: string = 'pending';
    private paymentDate?: string | null;
    private expenses: Expense[];
    private value: number;

    public static STATUS_PAID = 'paid';
    public static STATUS_PENDING = 'pending';
    public static STATUS_PARCIAL = 'parcial';

    constructor(closingDate: string, dueDate: string, idBankAccount: number, name: string, id?: number, status?: string, paymentDate?: string | null) {
        this.closingDate = closingDate;
        this.dueDate = dueDate;
        this.idBankAccount = idBankAccount;
        this.name = name;
        this.id = id;
        this.status = status
        this.paymentDate = paymentDate;
    }

    getClosingDate() {
        return this.closingDate;
    }

    getDueDate() {
        return this.dueDate;
    }

    getIdBankAccount() {
        return this.idBankAccount;
    }

    getName() {
        return this.name;
    }

    getId() {
        return this.id;
    }

    getStatus() {
        return this.status;
    }

    getPaymentDate() {
        return this.paymentDate;
    }

    getExpenses() {
        return this.expenses;
    }

    getValue() {
        return this.value;
    }

    setId(id: number) {
        this.id = id;
    }

    setPaymentDate(date: string) {
        this.paymentDate = date
    }

    setExpenses(expenses: Expense[] | []) {
        this.expenses = expenses;
    }

    setValue(value: number) {
        this.value = value;
    }

    setStatus(status: string) {
        this.status = status;
    }
}