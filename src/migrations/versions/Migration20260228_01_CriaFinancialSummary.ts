import { Database } from "src/enum/database.enum";
import { IMigration } from "../core/IMigration";
import { IMigrationStepProcessor } from "../core/IMigrationStepProcessor";
import { MigrationSteps } from "../core/MigrationSteps";

export class Migration20260228_01_CriaFinancialEvents implements IMigration {
    readonly name = 'Cria tabela financial_events';

    execute(): IMigrationStepProcessor[] {
        return [
            MigrationSteps.RunSQL(
                `CREATE TABLE IF NOT EXISTS financial_events (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    clientId BIGINT NOT NULL,
                    accountId BIGINT NOT NULL,
                    type ENUM(
                        'PAYMENT_POSTED',
                        'TRANSFER_POSTED',
                        'ADJUSTMENT',
                        'REVERSAL',
                        'OPENING_BALANCE',
                        'REVENUE_RECEIVED'
                    ) NOT NULL,
                    amount DECIMAL(15,2) NOT NULL,
                    occurredAt DATETIME NOT NULL,
                    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    sequenceNumber BIGINT NOT NULL,
                    referenceType VARCHAR(50),
                    referenceId BIGINT,
                    previousHash VARCHAR(255) NOT NULL,
                    eventHash VARCHAR(255) NOT NULL,
                    INDEX idx_client_sequence (clientId, sequenceNumber),
                    INDEX idx_account (accountId),
                    INDEX idx_occurredAt (occurredAt)
                );`
            ),
            MigrationSteps.RunSQL(
                `ALTER TABLE revenue ADD COLUMN status ENUM('pending', 'paid', 'partial') DEFAULT 'pending';`
            ),
            MigrationSteps.RunSQL(
                `ALTER TABLE revenue ADD COLUMN paymentDate DATETIME DEFAULT NULL;`
            ),
            MigrationSteps.RunSQL(
                `ALTER TABLE expense MODIFY COLUMN status ENUM('paid', 'partial', 'pending', 'cancelled', 'reversed');`
            ),
            MigrationSteps.RunSQL(
                `ALTER TABLE revenue MODIFY COLUMN status ENUM('pending', 'paid', 'partial', 'cancelled', 'reversed');`
            ),
            MigrationSteps.RunSQL(
                `ALTER TABLE payment ADD COLUMN reversed DATETIME DEFAULT NULL;`
            ),
            MigrationSteps.RunSQL(
                `ALTER TABLE payment ADD COLUMN accountId BIGINT DEFAULT 0;`
            ),
            MigrationSteps.RunSQL(
                `ALTER TABLE invoices MODIFY COLUMN status ENUM('paid', 'pending', 'partial', 'reversed');`
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