import { PoolConnection } from 'mysql2/promise';

/**
 * Interface que representa um processor de etapa de migration.
 *
 * Inspirado em IMigrationStepProcessor.php — cada tipo de step
 * (SQL, Script, ClearCache, etc.) implementa esta interface.
 *
 * O Runner não precisa saber o que cada step faz — apenas chama process().
 * Novos tipos de step podem ser criados sem alterar o Runner.
 */
export interface IMigrationStepProcessor {
  /**
   * Processa esta etapa da migration.
   * Recebe a conexão ativa para que steps transacionais
   * participem da mesma transação.
   */
  process(connection: PoolConnection): Promise<void>;

  /**
   * Nome descritivo para logs.
   */
  readonly label: string;

  /**
   * Retorna um payload determinístico para checksum.
   * Se não existir, o runner usa o `label`.
   */
  checksumPayload?(): string;
}