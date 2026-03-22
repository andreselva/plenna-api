import { Database } from "src/enum/database.enum";
import { IMigration } from "../core/IMigration";
import { IMigrationStepProcessor } from "../core/IMigrationStepProcessor";
import { MigrationSteps } from "../core/MigrationSteps";

export class Migration20260320_03_CriaNovaTabelaBankAccounts implements IMigration {
    readonly name = 'Cria nova tabela bank_accounts';

    execute(): IMigrationStepProcessor[] {
        return [
            MigrationSteps.RunSQL(
                `CREATE TABLE IF NOT EXISTS bank_accounts (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    clientId BIGINT NOT NULL,
                    name VARCHAR(150) NOT NULL,
                    type ENUM('CHECKING', 'SAVINGS', 'DIGITAL_WALLET', 'INVESTMENT', 'PHYSICAL_WALLET'),
                    bankCode INTEGER,
                    agency VARCHAR(20),
                    accountNumber VARCHAR(30),
                    initialBalance DECIMAL(14,2) DEFAULT 0,
                    currentBalance DECIMAL(14,2) DEFAULT 0,
                    isActive BOOLEAN DEFAULT TRUE,
                    createdAt DATETIME NOT NULL,
                    updatedAt DATETIME NULL,
                    deletedAt DATETIME NULL,
                    INDEX idx_client (clientId),
                    INDEX idx_active (isActive)
                );`
            )
        ];
    }

    executeBeforeDeploy(): IMigrationStepProcessor[] {
        return []
    }

    getDatabases(): Database[] {
        return [Database.PLENNA];
    }

    isTransactional(): boolean {
        return false;
    }
}