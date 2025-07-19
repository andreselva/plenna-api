import { Expense } from "src/Finance/Expenses/Entity/Expense";
import { InvoiceStatus } from "../Types/invoice.status.type";

export default class Invoice {
    private closingDate: string;
    private dueDate: string;
    private idBankAccount: number;
    private name: string;
    private id?: number;
    private status?: InvoiceStatus = 'pending';
    private paymentDate?: string | null;
    private expenses: Expense[];
    private value: number;
    private totalPaid: number = 0;

    public static readonly STATUS_PAID: InvoiceStatus = 'paid';
    public static readonly STATUS_PENDING: InvoiceStatus = 'pending';
    public static readonly STATUS_PARCIAL: InvoiceStatus = 'parcial';

    constructor(closingDate: string, dueDate: string, idBankAccount: number, name: string, id?: number, status?: InvoiceStatus, paymentDate?: string | null) {
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
        if (!this.id) {
            return 0;
        }
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

    setStatus(status: InvoiceStatus) {
        this.status = status;
    }

    getTotalPaid() {
        return this.totalPaid;
    }
    
    setTotalPaid(totalPaid: number) {
        this.totalPaid = totalPaid;
    }
}