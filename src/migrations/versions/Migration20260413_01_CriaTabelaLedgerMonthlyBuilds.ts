import { Database } from 'src/enum/database.enum';
import { IMigration } from '../core/IMigration';
import { IMigrationStepProcessor } from '../core/IMigrationStepProcessor';
import { MigrationSteps } from '../core/MigrationSteps';

export class Migration20260413_01_CriaTabelaLedgerMonthlyBuilds implements IMigration {
    readonly name = 'Cria tabela ledger_monthly_builds e índice de evento por período';

    execute(): IMigrationStepProcessor[] {
        return [
            MigrationSteps.RunSQL(
                `CREATE TABLE IF NOT EXISTS ledger_monthly_builds (
                    id                   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    clientId             BIGINT UNSIGNED NOT NULL,
                    period               VARCHAR(7) NOT NULL,
                    closedAt             DATETIME NULL,
                    closingBalance       DECIMAL(15,2) NULL,
                    openChargesCount     INT UNSIGNED NOT NULL DEFAULT 0,
                    openChargesValue     DECIMAL(15,2) NOT NULL DEFAULT 0,
                    pendingExpenses      DECIMAL(15,2) NOT NULL DEFAULT 0,
                    pendingRevenues      DECIMAL(15,2) NOT NULL DEFAULT 0,
                    buildData            JSON NOT NULL,
                    builtAt              DATETIME NOT NULL,
                    createdAt            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE KEY uk_client_period (clientId, period)
                );`
            ),
            MigrationSteps.RunSQL(
                `CREATE INDEX IF NOT EXISTS idx_client_type_occurred
                 ON financial_events (clientId, type, occurredAt);`
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
