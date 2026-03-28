import { Database } from "src/enum/database.enum";
import { IMigration } from "../core/IMigration";
import { IMigrationStepProcessor } from "../core/IMigrationStepProcessor";
import { MigrationSteps } from "../core/MigrationSteps";

export class Migration20260328_01_AdicionaConstraintUnicaLedgerEntries implements IMigration {
    readonly name = 'Adiciona constraint única para evitar duplicidade em ledger_entries';

    execute(): IMigrationStepProcessor[] {
        return [
            MigrationSteps.RunSQL(
                `ALTER TABLE ledger_entries
                 ADD UNIQUE KEY uk_ledger_entries_event_uniqueness (
                    clientId,
                    eventId,
                    accountId,
                    entityId,
                    entityType,
                    type,
                    amount,
                    liquidity
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
