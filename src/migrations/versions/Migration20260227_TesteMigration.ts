import { IMigration } from "../core/IMigration";
import { IMigrationStepProcessor } from "../core/IMigrationStepProcessor";
import { MigrationSteps } from "../core/MigrationSteps";

export class Migration20260227_TesteMigration implements IMigration {
    readonly version = '20260227';
    readonly name    = 'Migration para teste';

    execute(): IMigrationStepProcessor[] {
        return [
            MigrationSteps.RunSQL(
                `UPDATE clients SET number = 630 WHERE id = 1`
            )
        ]
    }

    executeBeforeDeploy(): IMigrationStepProcessor[] {
        return []
    }

    getDatabases(): string[] {
        return ['railway']
    }

    isTransactional(): boolean {
        return false;
    }
}