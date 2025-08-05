import EntityModel from "./entity.model";

export default class PaymentModel extends EntityModel {
    id: number;
    value: number;
    payment_date: string;
    payable_type: string;
    payable_id: number;

    constructor() {
        super();
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