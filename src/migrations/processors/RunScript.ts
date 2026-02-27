import { PoolConnection } from 'mysql2/promise';
import { IMigrationStepProcessor } from '../core/IMigrationStepProcessor';
import { ScriptConstructor } from '../core/IScript';

/**
 * Processor que executa um script TypeScript.
 *
 * Uso: MigrationSteps.RunScript(ScriptClass)
 */
export class RunScript implements IMigrationStepProcessor {
  readonly label: string;

  constructor(private readonly scriptClass: ScriptConstructor) {
    this.label = `RunScript(${scriptClass.name})`;
  }

  checksumPayload(): string {
    return `script:${this.scriptClass.name}`;
  }

  async process(connection: PoolConnection): Promise<void> {
    const script = new this.scriptClass(connection);
    await script.execute();
  }
}