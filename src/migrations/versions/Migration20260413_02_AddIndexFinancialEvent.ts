import { Database } from "src/enum/database.enum";
import { IMigration } from "../core/IMigration";
import { IMigrationStepProcessor } from "../core/IMigrationStepProcessor";
import { MigrationSteps } from "../core/MigrationSteps";

export class Migration20260413_02_AddIndexFinancialEvent implements IMigration {
    readonly name = "Add index to financial_events for type and clientId";

    execute(): IMigrationStepProcessor[] {
        return [
            MigrationSteps.RunSQL(
                `CREATE INDEX idx_financial_events_client_type ON financial_events (clientId, type);`
            )
        ]
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