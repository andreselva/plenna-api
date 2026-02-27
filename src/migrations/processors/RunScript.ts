import { PoolConnection } from 'mysql2/promise';
import { IMigrationStepProcessor } from '../core/IMigrationStepProcessor';
import { ScriptConstructor } from '../core/IScript';

/**
 * Processor que executa um script TypeScript.
 * Inspirado em RunScript.php.
 *
 * Recebe a referência da classe (não a instância) e a instancia
 * na hora de process(), passando a conexão ativa — garantindo que
 * o script participa da transação quando isTransactional = true.
 *
 * Uso:
 *   MigrationSteps.RunScript(SeedModulosScript)
 */
export class RunScript implements IMigrationStepProcessor {
  readonly label: string;

  constructor(private readonly scriptClass: ScriptConstructor) {
    this.label = `RunScript(${scriptClass.name})`;
  }

  async process(connection: PoolConnection): Promise<void> {
    const script = new this.scriptClass(connection);
    await script.execute();
  }
}
