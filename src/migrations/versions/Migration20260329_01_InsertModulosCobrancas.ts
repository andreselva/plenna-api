import { Database } from "src/enum/database.enum"
import { IMigration } from "../core/IMigration"
import { IMigrationStepProcessor } from "../core/IMigrationStepProcessor"
import { MigrationSteps } from "../core/MigrationSteps"

export class Migration20260329_01_InsertModulosCobrancas implements IMigration {
    readonly name = 'Insere módulos de cobranças no sistema';

    execute() {
        return [
            MigrationSteps.RunSQL(
                `INSERT INTO modules (name, location, description, showInSidebar,  \`group\`, displayName) VALUES
                ('billing', null, 'Gerenciamento de cobranças', 0, '', 'Cobranças'),
                ('customers', '/customers', 'Registro de clientes para cobranças', 1, 'navigation', 'Clientes'),
                ('charges', '/charges', 'Tela de registros de cobranas', 1, 'navigation', 'Cobranças'),
                ('payment-methods', '/payment-methods', 'Formas de pagamento para cobranças', 0, 'config', 'Formas de pagamento'),
                ('billing-rules', '/billing-rules', 'Cadastro de regras de cobrança', 0, 'config', 'Regras de cobrança'),
                ('gateways', '/gateways', 'Gateways de pagamento', 0, 'config', 'Gateways de pagamento'),
                ('gateways-config', null, 'Configuração de gateways de pagamento', 0, 'config', 'Configuração de Gateways');`
            ),
            MigrationSteps.RunSQL(
                `UPDATE modules SET parentId = '19' WHERE id = 20`
            ),
            MigrationSteps.RunSQL(
                `UPDATE modules SET parentId = '14' WHERE id = 16`
            ),
            MigrationSteps.RunSQL(
                `UPDATE modules SET parentId = '14' WHERE id = 17`
            ),
            MigrationSteps.RunSQL(
                `UPDATE modules SET parentId = '14' WHERE id = 18`
            ),
            MigrationSteps.RunSQL(
                `UPDATE modules SET parentId = '14' WHERE id = 19`
            )
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