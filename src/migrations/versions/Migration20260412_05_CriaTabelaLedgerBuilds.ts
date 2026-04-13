import { Database } from 'src/enum/database.enum';
import { IMigration } from '../core/IMigration';
import { IMigrationStepProcessor } from '../core/IMigrationStepProcessor';
import { MigrationSteps } from '../core/MigrationSteps';

export class Migration20260412_05_CriaTabelaLedgerBuilds implements IMigration {
    readonly name = 'Cria tabela ledger_builds';

    execute(): IMigrationStepProcessor[] {
        return [
            MigrationSteps.RunSQL(
                `CREATE TABLE IF NOT EXISTS ledger_builds (
                    id                   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    clientId             BIGINT UNSIGNED NOT NULL,
                    builtAt              DATETIME NOT NULL,
                    totalLiquidBalance   DECIMAL(15,2) NOT NULL DEFAULT 0,
                    openChargesCount     INT UNSIGNED NOT NULL DEFAULT 0,
                    openChargesValue     DECIMAL(15,2) NOT NULL DEFAULT 0,
                    pendingExpensesCount INT UNSIGNED NOT NULL DEFAULT 0,
                    pendingExpensesValue DECIMAL(15,2) NOT NULL DEFAULT 0,
                    pendingRevenuesCount INT UNSIGNED NOT NULL DEFAULT 0,
                    pendingRevenuesValue DECIMAL(15,2) NOT NULL DEFAULT 0,
                    buildData            JSON NOT NULL,
                    createdAt            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_client_built (clientId, builtAt)
                );`
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
