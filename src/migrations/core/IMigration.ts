import { IMigrationStepProcessor } from './IMigrationStepProcessor';

/**
 * Contrato que toda migration deve implementar.
 *
 * Combina o melhor das duas arquiteturas:
 * - MigrationBase.php: isBeforeDeploy(), isTransactional(), getDatabases()
 * - Plenna v1: fases separadas como métodos distintos (execute / executeBeforeDeploy)
 *   permitindo descrever as duas fases em um único arquivo de migration.
 */
export interface IMigration {
  /** Versão única e imutável. Ex: '001', '2025-05-25' */
  readonly version: string;

  /** Nome descritivo para logs e tabela de controle */
  readonly name: string;

  /**
   * Passos executados APÓS o deploy do novo código.
   * Ex: INSERT, UPDATE, DROP COLUMN, ALTER ENUM.
   */
  execute(): IMigrationStepProcessor[];

  /**
   * Passos executados ANTES do deploy.
   * Ex: ADD COLUMN nullable, CREATE INDEX, CREATE TABLE.
   * Retorna array vazio quando não há passos before-deploy.
   */
  executeBeforeDeploy(): IMigrationStepProcessor[];

  getDatabases(): string[];

  /**
   * Se true, todos os steps de execute() são envolvidos em
   * BEGIN / COMMIT com ROLLBACK automático em falha.
   *
   * Use false para migrations com DDL (MySQL faz commit implícito em DDL).
   */
  isTransactional(): boolean;
}
