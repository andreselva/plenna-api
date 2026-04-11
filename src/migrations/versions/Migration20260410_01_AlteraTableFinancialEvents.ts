import { Database } from "src/enum/database.enum";
import { IMigration } from "../core/IMigration";
import { IMigrationStepProcessor } from "../core/IMigrationStepProcessor";
import { MigrationSteps } from "../core/MigrationSteps";

export class Migration20260410_01_AlteraTableFinancialEvents implements IMigration {
    readonly name = 'Adiciona indice desc e constraint em sequenceNumber';

    execute(): IMigrationStepProcessor[] {
        return [
            MigrationSteps.RunSQL(
                `ALTER TABLE financial_events DROP INDEX idx_client_sequence,
                ADD CONSTRAINT ux_client_sequence UNIQUE (clientId, sequenceNumber);`
            ),
            MigrationSteps.RunSQL(
                `CREATE INDEX idx_client_sequence_desc  ON financial_events (clientId, sequenceNumber DESC);`
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
