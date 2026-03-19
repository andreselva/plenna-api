import { PoolConnection } from "mysql2/promise";
import { IScript } from "../core/IScript";
import { PaymentType } from "src/modules/Finance/Payment/Types/payment.type";
import { FinancialEvents } from "src/EntityModels/FinancialEvent";

export class CriaEventosPagamentoScript implements IScript {
    constructor(private readonly connection: PoolConnection) {}
    async execute(): Promise<void> {
        const [payments] = await this.connection.query(
            `SELECT * FROM payment`
        )

        for (const p of payments as any[]) {
            let value = p.value;
            if ([PaymentType.EXPENSE, PaymentType.INVOICE].includes(p.payable_type)) {
                value = -Math.abs(p.value);
            }

            const event = new FinancialEvents();
            event.clientId = p.clientId;

        }
    }
}