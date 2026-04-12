import { Database } from 'src/enum/database.enum';
import { IMigration } from '../core/IMigration';
import { IMigrationStepProcessor } from '../core/IMigrationStepProcessor';
import { MigrationSteps } from '../core/MigrationSteps';

export class Migration20260412_01_CriaTabelaTransfer implements IMigration {
    readonly name = 'Cria tabela transfer';

    execute(): IMigrationStepProcessor[] {
        return [
            MigrationSteps.RunSQL(
                `CREATE TABLE IF NOT EXISTS transfer (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    clientId BIGINT NOT NULL,
                    originAccount BIGINT NOT NULL,
                    targetAccount BIGINT NOT NULL,
                    amount DECIMAL(15, 2) NOT NULL,
                    transferDate DATETIME NOT NULL,
                    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updatedAt DATETIME,
                    INDEX idx_client (clientId),
                    INDEX idx_origin_account (originAccount),
                    INDEX idx_target_account (targetAccount)
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
