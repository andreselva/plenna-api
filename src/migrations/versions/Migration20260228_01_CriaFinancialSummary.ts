import { Database } from "src/enum/database.enum";
import { IMigration } from "../core/IMigration";
import { IMigrationStepProcessor } from "../core/IMigrationStepProcessor";
import { MigrationSteps } from "../core/MigrationSteps";

export class Migration20260227_02_CriaFinancialEvents implements IMigration {
    readonly name = 'Cria tabela financial_events';

    execute(): IMigrationStepProcessor[] {
        return [
            MigrationSteps.RunSQL(
                `CREATE TABLE financial_events (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    clinetId BIGINT NOT NULL,
                    accountId BIGINT NOT NULL,
                    type ENUM(
                        'EXPENSE_POSTED',
                        'REVENUE_POSTED',
                        'TRANSFER_POSTED',
                        'ADJUSTMENT',
                        'REVERSAL',
                        'OPENING_BALANCE'
                    ) NOT NULL,
                    amount DECIMAL(15,2) NOT NULL,
                    occurredAt DATETIME NOT NULL,
                    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    sequenceNumber BIGINT NOT NULL,
                    referenceType VARCHAR(50),
                    referenceId BIGINT
                    previousHash VARCHAR(255) NOT NULL,
                    eventHash VARCHAR(255) NOT NULL,
                    INDEX idx_client_sequence (clientId, sequenceNumber),
                    INDEX idx_account (accountId),
                    INDEX idx_occurredAt (occurredAt)
                );`
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