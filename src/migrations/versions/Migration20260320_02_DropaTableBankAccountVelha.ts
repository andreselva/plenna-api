import { Database } from "src/enum/database.enum";
import { IMigration } from "../core/IMigration";
import { IMigrationStepProcessor } from "../core/IMigrationStepProcessor";
import { MigrationSteps } from "../core/MigrationSteps";

export class Migration20260320_02_DropaTableBankAccountVelha implements IMigration {
    readonly name = 'Dropa bank_account';

    execute(): IMigrationStepProcessor[] {
        return [
            MigrationSteps.RunSQL(
                `DROP TABLE bank_account`
            ),
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