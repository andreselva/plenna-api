import { PoolConnection } from 'mysql2/promise';

/**
 * Interface base para scripts de migration.
 * Inspirado em IMigrationScript.php.
 *
 * Scripts recebem a conexão ativa no construtor — participam
 * da transação aberta pelo Runner quando isTransactional = true.
 */
export interface IScript {
  execute(): Promise<void>;
}

/**
 * Tipo do construtor de um IScript.
 * Usado por RunScript para instanciar o script com a conexão correta.
 */
export type ScriptConstructor = new (connection: PoolConnection) => IScript;
