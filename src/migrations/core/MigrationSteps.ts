import { IMigrationStepProcessor } from '../core/IMigrationStepProcessor';
import { ScriptConstructor } from '../core/IScript';
import { RunSQL } from '../processors/RunSQL';
import { RunScript } from '../processors/RunScript';
import { RunEffect } from '../processors/RunEffect';
import { PoolConnection } from 'mysql2/promise';

/**
 * Fábrica estática de steps de migration.
 *
 * É a única classe que o autor de uma migration precisa conhecer.
 *
 * O Runner recebe IMigrationStepProcessor[] e chama process() em cada um —
 * não sabe e não precisa saber qual tipo de step está executando.
 */
export class MigrationSteps {
  /**
   * Executa SQL puro.
   * Suporta múltiplas statements separadas por ponto-e-vírgula.
   *
   * @example
   * MigrationSteps.RunSQL(`
   *   ALTER TABLE expense ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
   *   CREATE INDEX idx_expense_status ON expense(status);
   * `)
   */
  static RunSQL(sql: string): IMigrationStepProcessor {
    return new RunSQL(sql);
  }

  /**
   * Executa uma classe TypeScript que implementa IScript.
   * A classe recebe a conexão ativa no construtor.
   *
   * @example
   * MigrationSteps.RunScript(SeedModulosScript)
   */
  static RunScript(scriptClass: ScriptConstructor): IMigrationStepProcessor {
    return new RunScript(scriptClass);
  }

  /**
   * Executa um efeito colateral arbitrário como step da migration.
   * Útil para limpeza de cache, chamadas a APIs internas, etc.
   * Inspirado em ClearParametersCache.php.
   *
   * @example
   * MigrationSteps.RunEffect('Limpar cache Redis', async () => {
   *   await redis.flushDb();
   * })
   */
  static RunEffect(
    description: string,
    fn: (connection: PoolConnection) => Promise<void>,
  ): IMigrationStepProcessor {
    return new RunEffect(description, fn);
  }
}
