import { Database } from "src/enum/database.enum";
import { IMigration } from "../core/IMigration";
import { IMigrationStepProcessor } from "../core/IMigrationStepProcessor";
import { MigrationSteps } from "../core/MigrationSteps";

export class Migration0002_TesteMigration implements IMigration {
    readonly version = '0002';
    readonly name    = 'Migration para teste 2';

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

    getDatabases(): string[] {
        return [
            Database.PLENNA
        ];
    }

    isTransactional(): boolean {
        return false;
    }
}