import { Database } from "src/enum/database.enum";
import { IMigration } from "../core/IMigration";
import { IMigrationStepProcessor } from "../core/IMigrationStepProcessor";
import { MigrationSteps } from "../core/MigrationSteps";

export class Migration20260327_01_CriaTabelasModuloCobrancas implements IMigration {
    readonly name = 'Cria tabelas do módulo de cobranças';
    
    execute(): IMigrationStepProcessor[] {
        return [
            MigrationSteps.RunSQL(
                `CREATE TABLE IF NOT EXISTS gateways (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(50),
                    gateway ENUM('PAGAR_ME', 'STRIPE', 'MERCADO_PAGO'),
                    icon VARCHAR(120)
                );`
            ),
            MigrationSteps.RunSQL(
                `CREATE TABLE IF NOT EXISTS gateway_configs (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    gatewayId BIGINT NOT NULL,
                    clientId BIGINT NOT NULL,
                    configs JSON
                );`
            ),
            MigrationSteps.RunSQL(
                `CREATE TABLE IF NOT EXISTS payment_methods (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(120),
                    code TINYINT(2)
                );`
            ),
            MigrationSteps.RunSQL(
                `CREATE TABLE IF NOT EXISTS billing_rules (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    clientId BIGINT NOT NULL,
                    gatewayId BIGINT,
                    paymentMethodId BIGINT,
                    customerId BIGINT
                );`
            ),
            MigrationSteps.RunSQL(
                `CREATE TABLE IF NOT EXISTS customer (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    clientId BIGINT NOT NULL,
                    name VARCHAR(120),
                    email VARCHAR(60), CONSTRAINT unique_client_email UNIQUE (clientId, email),
                    document VARCHAR(20), CONSTRAINT unique_client_document UNIQUE (clientId, document),
                    cep VARCHAR(15),
                    street VARCHAR(120),
                    number VARCHAR(20),
                    neighborhood VARCHAR(70),
                    city VARCHAR(70),
                    state CHAR(2),
                    country VARCHAR(50)
                );`
            ),
            MigrationSteps.RunSQL(
                `CREATE TABLE IF NOT EXISTS charges (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    clientId BIGINT NOT NULL,
                    gatewayId BIGINT, 
                    billingRuleId BIGINT,
                    customerId BIGINT,
                    expenseId BIGINT NOT NULL,
                    amount DECIMAL(15,2) NOT NULL,
                    status ENUM('DRAFT', 'PROCESSING', 'AWAITING_PAYMENT', 'PAID', 'FAILED', 'CANCELED', 'EXPIRED'),
                    qrcode VARCHAR(250),
                    externalId VARCHAR(250),
                    paymentLink VARCHAR(250),
                    paymentAt DATETIME
                );`
            ),
            MigrationSteps.RunSQL(
                `INSERT INTO payment_methods (name, code) VALUES
                    ('Dinheiro', 01),
                    ('Cheque', 02),
                    ('Cartão de Crédito', 03),
                    ('Cartão de Débito', 04),
                    ('Cartão da Loja (Private Label), Crediário Digital, Outros Crediários', 05),
                    ('Vale Alimentação', 10),
                    ('Vale Refeição', 11),
                    ('Vale Presente', 12),
                    ('Vale Combustível', 13),
                    ('Duplicata Mercantil', 14),
                    ('Boleto Bancário', 15),
                    ('Depósito Bancário', 16),
                    ('Pagamento Instantâneo (PIX) - Dinâmico', 17),
                    ('Transferência bancária, Carteira Digital', 18),
                    ('Programa de fidelidade, Cashback, Crédito Virtual', 19),
                    ('Pagamento Instantâneo (PIX) - Estático', 20),
                    ('Crédito em Loja', 21),
                    ('Outros', 99);`
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
