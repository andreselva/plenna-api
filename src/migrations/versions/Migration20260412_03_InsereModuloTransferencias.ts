import { Database } from 'src/enum/database.enum';
import { IMigration } from '../core/IMigration';
import { IMigrationStepProcessor } from '../core/IMigrationStepProcessor';
import { MigrationSteps } from '../core/MigrationSteps';

export class Migration20260412_03_InsereModuloTransferencias implements IMigration {
    readonly name = 'Insere módulo de transferências bancárias';

    execute(): IMigrationStepProcessor[] {
        return [
            MigrationSteps.RunSQL(
                `INSERT INTO modules (name, location, description, showInSidebar, \`group\`, displayName)
                VALUES ('transfers', '/transfers', 'Transferências bancárias entre contas', 1, 'navigation', 'Transferências');`
            ),
            MigrationSteps.RunSQL(
                `UPDATE modules child
                JOIN modules parent ON parent.name = 'financial'
                SET child.parentId = parent.id
                WHERE child.name = 'transfers';`
            ),
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
