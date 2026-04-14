import { Database } from 'src/enum/database.enum';
import { IMigration } from '../core/IMigration';
import { IMigrationStepProcessor } from '../core/IMigrationStepProcessor';
import { MigrationSteps } from '../core/MigrationSteps';

export class Migration20260413_03_RemoveTabelaLedgerBuilds implements IMigration {
    readonly name = 'Remove tabela ledger_builds';

    execute(): IMigrationStepProcessor[] {
        return [
            MigrationSteps.RunSQL('DROP TABLE IF EXISTS ledger_builds;'),
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
