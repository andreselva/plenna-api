import { Database } from "src/enum/database.enum";
import { IMigration } from "../core/IMigration";
import { IMigrationStepProcessor } from "../core/IMigrationStepProcessor";
import { MigrationSteps } from "../core/MigrationSteps";

export class Migration20260321_01_CriaTableLedgerEntries implements IMigration {
    readonly name = 'Cria table ledger_entries';
    
    execute(): IMigrationStepProcessor[] {
        return [
            MigrationSteps.RunSQL(
                `CREATE TABLE IF NOT EXISTS ledger_entries (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    clientId BIGINT NOT NULL,
                    eventId BIGINT NOT NULL,
                    accountId BIGINT,
                    entityId BIGINT NOT NULL,
                    entityType VARCHAR(50),
                    amount DECIMAL(15, 2),
                    type ENUM(
                        'REVENUE',
                        'EXPENSE',
                        'INVOICE',
                        'ACCOUNT_OPENING',
                        'PHYSICAL_WALLET',
                        'DIGITAL_WALLET',
                        'INVESTMENT',
                        'CHECKING',
                        'SAVINGS',
                        'TRANSFER'
                    ),
                    metadata JSON,
                    liquidity BOOLEAN DEFAULT false,
                    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_client (clientId),
                    INDEX idx_event (eventId),
                    INDEX idx_account_liquidity (accountId, liquidity),
                    INDEX idx_entity (entityType, entityId)
                );`
            ),
            MigrationSteps.RunSQL(
                `CREATE TABLE IF NOT EXISTS ledger_event_processing (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    eventId BIGINT NOT NULL,
                    processedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE KEY uk_ledger_event_processing_eventId (eventId)
                );`
            )
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