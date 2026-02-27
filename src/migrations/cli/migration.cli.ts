import 'dotenv/config';
import { MigrationRunner } from '../core/MigrationRunner';
import { MIGRATION_REGISTRY } from '../core/MigrationRegistry';

async function main(): Promise<void> {
  const command = process.argv[2];
  const runner  = new MigrationRunner(MIGRATION_REGISTRY);

  try {
    switch (command) {

      case 'run': {
        console.log('\n═══════════════════════════════════════');
        console.log('  Migrations — Fase: execute');
        console.log('═══════════════════════════════════════\n');
        await runner.runPhase('execute');
        console.log('✅ Migrations concluídas com sucesso.\n');
        break;
      }

      case 'before-deploy': {
        console.log('\n═══════════════════════════════════════');
        console.log('  Migrations — Fase: before-deploy');
        console.log('═══════════════════════════════════════\n');
        await runner.runPhase('beforeDeploy');
        console.log('✅ Before-deploy concluído com sucesso.\n');
        break;
      }

      case 'status': {
        const statuses = await runner.getStatus();
        const done     = statuses.filter((s) =>  s.executed);
        const pending  = statuses.filter((s) => !s.executed);
        const failed   = statuses.filter((s) => s.record && !s.record.success);

        console.log('\n═══════════════════════════════════════');
        console.log(`  Migrations — Status (${statuses.length} total)`);
        console.log('═══════════════════════════════════════\n');

        console.log(`  ✅ Executadas: ${done.length}`);
        for (const { migration, record } of done) {
          console.log(`      [${migration.version}] ${migration.name}  (${record?.executed_at ?? ''})`);
        }

        if (failed.length > 0) {
          console.log(`\n  ❌ Com falha: ${failed.length}`);
          for (const { migration, record } of failed) {
            console.log(`      [${migration.version}] ${migration.name}`);
            console.log(`           Step que falhou: ${record?.failed_step ?? '?'}`);
            console.log(`           Erro: ${record?.error_msg ?? '?'}`);
          }
        }

        console.log(`\n  ⏳ Pendentes: ${pending.length}`);
        for (const { migration } of pending) {
          console.log(`      [${migration.version}] ${migration.name}`);
        }
        console.log('');
        break;
      }

      default: {
        console.log(`
Uso: ts-node src/migrations/cli/migration.cli.ts <command>

Comandos:
  run             Executa migrations pendentes (fase execute)
  before-deploy   Executa a fase before-deploy
  status          Lista status, incluindo falhas com step e mensagem de erro
        `);
        process.exit(1);
      }
    }
  } finally {
    await runner.close();
  }
}

main().catch((err) => {
  console.error('\n❌ Erro fatal:', err.message ?? err);
  process.exit(1);
});