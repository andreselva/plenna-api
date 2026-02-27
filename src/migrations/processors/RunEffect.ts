import { PoolConnection } from 'mysql2/promise';
import { IMigrationStepProcessor } from '../core/IMigrationStepProcessor';

/**
 * Processor que executa uma função de limpeza/efeito colateral arbitrária.
 * Inspirado em ClearParametersCache.php.
 *
 * Demonstra o poder do padrão IMigrationStepProcessor:
 * um novo tipo de step foi criado sem alterar absolutamente
 * nenhuma linha do MigrationRunner.
 *
 * Uso:
 *   MigrationSteps.RunEffect('Limpar cache Redis', async () => {
 *     await redisClient.flushDb();
 *   })
 */
export class RunEffect implements IMigrationStepProcessor {
  readonly label: string;

  constructor(
    description: string,
    private readonly fn: (connection: PoolConnection) => Promise<void>,
  ) {
    this.label = `RunEffect(${description})`;
  }

  async process(connection: PoolConnection): Promise<void> {
    await this.fn(connection);
  }
}
