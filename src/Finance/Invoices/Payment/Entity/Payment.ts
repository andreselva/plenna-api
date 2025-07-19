export default class Payment {
    private value: number;
    private paymentDate: string;
    private expenses: object[] = [];
    private idInvoice?: number;
    private id?: number;

    constructor(value: number, paymentDate: string, expenses: object[], idInvoice?: number, id?: number) {
        this.value = value;
        this.paymentDate = paymentDate;
        this.expenses = expenses;
        this.idInvoice = idInvoice;
        this.id = id;
    }

    public getId(): number | undefined {
        return this.id;
    }

    public setId(id: number): void {
        this.id = id;
    }

    public getIdInvoice(): number | undefined {
        return this.idInvoice;
    }

    public setIdInvoice(idInvoice: number): void {
        this.idInvoice = idInvoice;
    }

    public getValue(): number {
        return this.value;
    }

    public setValue(value: number): void {
        this.value = value;
    }

    public getPaymentDate(): string {
        return this.paymentDate;
    }
    
    public setPaymentDate(paymentDate: string): void {
        this.paymentDate = paymentDate;
    }

    public getExpenses(): object[] {
        return this.expenses;
    }
}