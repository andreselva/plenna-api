import { Database } from "src/enum/database.enum";
import { IMigration } from "../core/IMigration";
import { IMigrationStepProcessor } from "../core/IMigrationStepProcessor";
import { MigrationSteps } from "../core/MigrationSteps";

export class Migration20260227_02_TesteMigration implements IMigration {
    readonly version = '20260227_02';
    readonly name    = 'Migration para teste';

    execute(): IMigrationStepProcessor[] {
        return [
            MigrationSteps.RunSQL(
                `UPDATE clients SET number = 63 WHERE id = 1`
            )
        ]
    }

    executeBeforeDeploy(): IMigrationStepProcessor[] {
        return []
    }

    getDatabases(): Database[] {
        return [Database.PLENNA]
    }

    isTransactional(): boolean {
        return false;
    }
}