import { MigrationRunner } from '../core/MigrationRunner';

async function main(): Promise<void> {
  const command = process.argv[2];
  const runner = new MigrationRunner();

  try {
    switch (command) {
      case 'run': {
        console.log('Migrations — Fase: execute');
        await runner.runPhase('execute');
        break;
      }

      case 'before-deploy': {
        console.log('Migrations — Fase: before-deploy');
        await runner.runPhase('beforeDeploy');
        break;
      }

      case 'status': {
        const status = await runner.getStatus();

        console.log('═══════════════════════════════════════');
        console.log(`  Migrations — Status (${status.length} total)`);
        console.log('═══════════════════════════════════════\n');

        const executed = status.filter((s) => s.executed);
        const pending = status.filter((s) => !s.executed);

        console.log(`   Executadas: ${executed.length}`);
        for (const s of executed) console.log(`      [${s.version}] ${s.name} (${s.database})`);

        console.log(`\n Pendentes: ${pending.length}`);
        for (const s of pending) console.log(`      [${s.version}] ${s.name} (${s.database})`);
        console.log('');
        break;
      }

      case 'dev': {
        console.log(`Migrations — DEV MODE`);
        await runner.runPhase('beforeDeploy');
        await runner.runPhase('execute');
        break;
      }

      default: {
        console.error(`Comando inválido: ${command}`);
        console.error('Comandos: run | before-deploy | status | dev');
        process.exitCode = 1;
      }
    }
  } finally {
    await runner.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});