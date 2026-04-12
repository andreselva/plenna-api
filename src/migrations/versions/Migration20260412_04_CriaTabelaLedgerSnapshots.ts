import { Database } from 'src/enum/database.enum';
import { IMigration } from '../core/IMigration';
import { IMigrationStepProcessor } from '../core/IMigrationStepProcessor';
import { MigrationSteps } from '../core/MigrationSteps';

export class Migration20260412_04_CriaTabelaLedgerSnapshots implements IMigration {
    readonly name = 'Cria tabela ledger_snapshots';

    execute(): IMigrationStepProcessor[] {
        return [
            MigrationSteps.RunSQL(
                `CREATE TABLE IF NOT EXISTS ledger_snapshots (
                    id                   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    clientId             BIGINT UNSIGNED NOT NULL,
                    accountId            BIGINT UNSIGNED NOT NULL,
                    balance              DECIMAL(15,2) NOT NULL DEFAULT 0,
                    lastEventId          BIGINT UNSIGNED NOT NULL,
                    lastSequenceNumber   BIGINT UNSIGNED NOT NULL,
                    lastEventHash        VARCHAR(64) NOT NULL,
                    snapshotDate         DATETIME NOT NULL,
                    createdAt            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_client_account (clientId, accountId),
                    INDEX idx_snapshot_date  (clientId, snapshotDate)
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
