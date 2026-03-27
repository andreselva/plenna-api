import { Database } from "src/enum/database.enum"
import { IMigration } from "../core/IMigration"
import { IMigrationStepProcessor } from "../core/IMigrationStepProcessor"
import { MigrationSteps } from "../core/MigrationSteps"

export class Migration20260327_02_AlteraTableExpenses implements IMigration {
    readonly name = 'Migration20260327_02_AlteraTableExpenses'

    execute() {
        return [
            MigrationSteps.RunSQL(
                `ALTER TABLE expense ADD COLUMN customerId BIGINT DEFAULT 0;`
            ),
            MigrationSteps.RunSQL(
                `ALTER TABLE expense ADD COLUMN paymentMethodId INT DEFAULT 0;`
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