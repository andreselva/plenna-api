import { Database } from 'src/enum/database.enum';
import { IMigrationStepProcessor } from './IMigrationStepProcessor';

/**
 * Contrato que toda migration deve implementar.
 *
 * Ex:
 *   export class Migration20260227_01_AddUserEmailIndex implements IMigration { ... }
 *   -> version = '20260227_01'
 */
export interface IMigration {
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

  getDatabases(): Database[];

  /**
   * Se true, todos os steps de execute() são envolvidos em
   * BEGIN / COMMIT com ROLLBACK automático em falha.
   *
   * Use false para migrations com DDL (MySQL faz commit implícito em DDL).
   */
  isTransactional(): boolean;
}