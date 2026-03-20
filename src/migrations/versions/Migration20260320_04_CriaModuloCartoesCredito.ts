import { Database } from "src/enum/database.enum";
import { IMigration } from "../core/IMigration";
import { IMigrationStepProcessor } from "../core/IMigrationStepProcessor";
import { MigrationSteps } from "../core/MigrationSteps";

export class Migration20260320_04_CriaModuloCartoesCredito implements IMigration {
    readonly name = 'Cria módulo de cartões de crédito'
    execute(): IMigrationStepProcessor[] {
        return [
            MigrationSteps.RunSQL(`
                INSERT INTO modules (parentId, name, location, description, showInSidebar, \`group\`, displayName) 
                VALUES (4, 'creditCards', '/credit-cards', 'Gerenciamento de cartões de crédito', 0, 'navigation', 'Cartões de crédito');`)
        ]
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