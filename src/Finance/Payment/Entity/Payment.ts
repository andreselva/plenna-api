import PaymentInicialDataDTO from "../DTOs/PaymentInicialDataDTO";
import { PaymentType } from "../Types/payment.type";

export default class Payment {
    private value: number;
    private paymentDate: string;
    private payableId: number;
    private payableType: PaymentType;
    private id?: number;

    constructor(dto: PaymentInicialDataDTO) {
        this.value = Number(dto.value);
        this.paymentDate = dto.paymentDate;
        this.payableId = dto.payableId;
        this.payableType = dto.payableType;
        this.id = dto.id;
    }

    public getId(): number | undefined {
        return this.id;
    }

    public getValue(): number {
        return this.value;
    }

    public getPaymentDate(): string {
        return this.paymentDate;
    }

    public getPayableId(): number {
        return this.payableId;
    }

    public getPayableType(): PaymentType {
        return this.payableType;
    }

    public setPaymentDate(paymentDate: string): void {
        this.paymentDate = paymentDate;
    }

    public setId(id: number): void {
        this.id = id;
    }

    public setValue(value: number): void {
        this.value = value;
    }
}