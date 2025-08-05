import EntityModelInterface from "./entity.model.interface";

export default class PaymentModel implements EntityModelInterface {
    id: number;
    value: number;
    payment_date: string;
    payable_type: string;
    payable_id: number;

    constructor() {
        this.id = 0;
        this.value = 0;
        this.payment_date = '';
        this.payable_type = '';
        this.payable_id = 0;
    }
    
    setTableName(): string {
        return 'payment';
    }

    setPrimaryKey(): string {
        return 'id';
    }
}