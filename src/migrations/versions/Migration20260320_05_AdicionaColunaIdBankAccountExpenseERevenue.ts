import { Database } from "src/enum/database.enum";
import { IMigration } from "../core/IMigration";
import { IMigrationStepProcessor } from "../core/IMigrationStepProcessor";
import { MigrationSteps } from "../core/MigrationSteps";

export class Migration20260320_05_AdicionaColunaIdBankAccountExpenseERevenue implements IMigration {
    readonly name = 'Adiciona coluna idBankAccount expense e revenue';
    
    execute(): IMigrationStepProcessor[] {
        return [
            MigrationSteps.RunSQL(`
                ALTER TABLE expense
                ADD COLUMN idBankAccount BIGINT NOT NULL DEFAULT 0;
            `),
            MigrationSteps.RunSQL(`
                ALTER TABLE revenue
                ADD COLUMN idBankAccount BIGINT NOT NULL DEFAULT 0;
            `),
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