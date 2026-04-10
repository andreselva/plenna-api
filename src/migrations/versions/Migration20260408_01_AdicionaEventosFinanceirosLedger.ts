import { Database } from "src/enum/database.enum";
import { IMigration } from "../core/IMigration";
import { IMigrationStepProcessor } from "../core/IMigrationStepProcessor";
import { MigrationSteps } from "../core/MigrationSteps";

export class Migration20260408_01_AdicionaEventosFinanceirosLedger implements IMigration {
    readonly name = 'Adiciona novos tipos de eventos financeiros e de ledger';

    execute(): IMigrationStepProcessor[] {
        return [
            MigrationSteps.RunSQL(
                `ALTER TABLE financial_events MODIFY COLUMN type ENUM(
                    'PAYMENT_POSTED',
                    'TRANSFER_POSTED',
                    'REVERSAL',
                    'OPENING_BALANCE',
                    'REVENUE_RECEIVED',
                    'CHARGE_GENERATED',
                    'CHARGE_PAID',
                    'CHARGE_CANCELLED',
                    'CHARGE_EXPIRED',
                    'CHARGE_REFUNDED',
                    'REVENUE_RECOGNIZED',
                    'EXPENSE_RECOGNIZED'
                ) NOT NULL;`
            ),
            MigrationSteps.RunSQL(
                `ALTER TABLE ledger_entries MODIFY COLUMN type ENUM(
                    'REVENUE',
                    'EXPENSE',
                    'INVOICE',
                    'ACCOUNT_OPENING',
                    'PHYSICAL_WALLET',
                    'DIGITAL_WALLET',
                    'INVESTMENT',
                    'CHECKING',
                    'SAVINGS',
                    'TRANSFER',
                    'CHARGE'
                );`
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
