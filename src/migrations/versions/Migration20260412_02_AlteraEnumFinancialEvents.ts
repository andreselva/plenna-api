import { Database } from "src/enum/database.enum";
import { IMigration } from "../core/IMigration";
import { IMigrationStepProcessor } from "../core/IMigrationStepProcessor";
import { MigrationSteps } from "../core/MigrationSteps";

export class Migration20260412_02_AlteraEnumFinancialEvents implements IMigration {
    readonly name: string = 'Altera enum table financial_events para transferências';

    execute(): IMigrationStepProcessor[] {
        return [
            MigrationSteps.RunSQL(
                `ALTER TABLE financial_events MODIFY COLUMN type
                 ENUM(
                 'PAYMENT_POSTED',
                 'TRANSFER_POSTED',
                 'REVERSAL',
                 'OPENING_BALANCE',
                 'REVENUE_RECEIVED',
                 'CHARGE_GENERATED',
                 'CHARGE_PAID',
                 'CHARGE_CANCELED',
                 'CHARGE_EXPIRED',
                 'CHARGE_REFUNDED',
                 'REVENUE_RECOGNIZED',
                 'EXPENSE_RECOGNIZED', 
                 'TRANSFER_RECEIVED'
                 ) NOT NULL;`
            )
        ];
    }

    executeBeforeDeploy(): IMigrationStepProcessor[] {
        return [];
    }

    getDatabases(): Database[] {
        return [Database.PLENNA];
    }

    isTransactional(): boolean {
        return false;
    }
}
