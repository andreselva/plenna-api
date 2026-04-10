import { Database } from "src/enum/database.enum"
import { IMigration } from "../core/IMigration"
import { IMigrationStepProcessor } from "../core/IMigrationStepProcessor"
import { MigrationSteps } from "../core/MigrationSteps"

export class Migration20260329_01_InsertModulosCobrancas implements IMigration {
    readonly name = 'Insere módulos de cobranças no sistema';

    execute() {
        return [
            MigrationSteps.RunSQL(
                `ALTER TABLE modules ADD CONSTRAINT UNIQUE (name)`
            ),
            MigrationSteps.RunSQL(
                `INSERT INTO gateways (name, gateway, icon) VALUES ('Pagar.me', 'PAGAR_ME', '')`
            ),
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
                `UPDATE modules child
                JOIN modules parent ON parent.name = 'gateways'
                SET child.parentId = parent.id
                WHERE child.name = 'gateways-config';`
            ),
            MigrationSteps.RunSQL(
                `UPDATE modules child
                JOIN modules parent ON parent.name = 'billing'
                SET child.parentId = parent.id
                WHERE child.name IN ('charges', 'payment-methods', 'billing-rules');`
            ),
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