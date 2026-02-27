import * as mysql from 'mysql2/promise';
import { MigrationRepositoryException } from '../exceptions/MigrationRepositoryException';

/**
 * Responsável por todas as operações na tabela schema_migrations.
 * Inspirado em MigrationRepository.php.
 *
 * Melhoria em relação à v1: as operações de banco de controle
 * estão isoladas aqui, fora do Runner — responsabilidade única.
 */
export class MigrationRepository {
  constructor(private readonly pool: mysql.Pool) {}

  /**
   * Garante que a tabela schema_migrations existe.
   * Também registra o step que falhou para facilitar diagnóstico.
   */
  async ensureTable(): Promise<void> {
    const conn = await this.pool.getConnection();
    try {
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          id           BIGINT AUTO_INCREMENT PRIMARY KEY,
          version      VARCHAR(100)  NOT NULL UNIQUE,
          name         VARCHAR(255)  NOT NULL,
          executed_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
          checksum     VARCHAR(64)   NOT NULL,
          success      BOOLEAN       NOT NULL DEFAULT true,
          failed_step  TINYINT       NULL COMMENT 'Índice (1-based) do step que falhou',
          error_msg    TEXT          NULL COMMENT 'Mensagem de erro em caso de falha',
          INDEX idx_version (version)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
    } catch (err: any) {
      throw new MigrationRepositoryException(
        `Não foi possível garantir a tabela de controle: ${err.message}`,
      );
    } finally {
      conn.release();
    }
  }

  /**
   * Retorna um Set com as versões já executadas com sucesso.
   */
  async getExecutedVersions(): Promise<Set<string>> {
    const conn = await this.pool.getConnection();
    try {
      const [rows] = await conn.execute<mysql.RowDataPacket[]>(
        `SELECT version FROM schema_migrations WHERE success = true`,
      );
      return new Set(rows.map((r) => r.version as string));
    } catch (err: any) {
      throw new MigrationRepositoryException(
        `Não foi possível recuperar as migrations aplicadas: ${err.message}`,
      );
    } finally {
      conn.release();
    }
  }

  /**
   * Registra uma migration executada com sucesso.
   */
  async registerSuccess(
    version: string,
    name: string,
    checksum: string,
    connection: mysql.PoolConnection,
  ): Promise<void> {
    try {
      await connection.execute(
        `INSERT INTO schema_migrations (version, name, checksum, success, failed_step, error_msg)
         VALUES (?, ?, ?, true, NULL, NULL)
         ON DUPLICATE KEY UPDATE
           success     = true,
           executed_at = NOW(),
           checksum    = VALUES(checksum),
           failed_step = NULL,
           error_msg   = NULL`,
        [version, name, checksum],
      );
    } catch (err: any) {
      throw new MigrationRepositoryException(
        `Não foi possível registrar o sucesso da migration ${version}: ${err.message}`,
      );
    }
  }

  /**
   * Registra uma migration que falhou.
   * Inclui o índice do step (1-based) e a mensagem de erro.
   * Inspirado na sugestão de melhoria: registrar ponto de falha.
   */
  async registerFailure(
    version: string,
    name: string,
    checksum: string,
    failedStep: number,
    errorMessage: string,
  ): Promise<void> {
    try {
      await this.pool.execute(
        `INSERT INTO schema_migrations (version, name, checksum, success, failed_step, error_msg)
         VALUES (?, ?, ?, false, ?, ?)
         ON DUPLICATE KEY UPDATE
           success     = false,
           executed_at = NOW(),
           failed_step = VALUES(failed_step),
           error_msg   = VALUES(error_msg)`,
        [version, name, checksum, failedStep, errorMessage],
      );
    } catch (_) {
      // Não propaga — já estamos no fluxo de erro da migration
    }
  }

  /**
   * Retorna todas as migrations com seu status.
   * Usado pelo comando status do CLI.
   */
  async getAll(): Promise<{ version: string; name: string; executed_at: string; success: boolean; failed_step: number | null; error_msg: string | null }[]> {
    const conn = await this.pool.getConnection();
    try {
      const [rows] = await conn.execute<mysql.RowDataPacket[]>(
        `SELECT version, name, executed_at, success, failed_step, error_msg
         FROM schema_migrations
         ORDER BY executed_at ASC`,
      );
      return rows as any[];
    } catch (err: any) {
      throw new MigrationRepositoryException(
        `Não foi possível recuperar o histórico de migrations: ${err.message}`,
      );
    } finally {
      conn.release();
    }
  }
}
