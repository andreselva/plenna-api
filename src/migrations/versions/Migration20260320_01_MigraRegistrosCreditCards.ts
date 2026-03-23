import { Database } from "src/enum/database.enum";
import { IMigration } from "../core/IMigration";
import { IMigrationStepProcessor } from "../core/IMigrationStepProcessor";
import { MigrationSteps } from "../core/MigrationSteps";
import { MigraDadosCreditCardsScript } from "../scripts/MigraDadosCreditCardsScript";

export class Migration20260320_01_MigraRegistrosCreditCards implements IMigration {
    readonly name = 'Cria tabela credit_cards e migra registros';

    execute(): IMigrationStepProcessor[] {
        return [
            MigrationSteps.RunSQL(
                `CREATE TABLE IF NOT EXISTS credit_cards (
                    id BIGINT auto_increment PRIMARY KEY,
                    name VARCHAR(50) NOT NULL,
                    generateInvoice TINYINT(1),
                    dueDate VARCHAR(2),
                    closingDate VARCHAR(2),
                    clientId BIGINT NOT NULL,
                    INDEX idx_client (clientId)
                );`
            ),
            MigrationSteps.RunScript(
                MigraDadosCreditCardsScript
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