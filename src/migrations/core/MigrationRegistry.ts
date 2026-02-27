import { IMigration } from './IMigration';

// ──────────────────────────────────────────────────────────────────────────────
// Registre aqui cada migration em ordem crescente de versão.
// NUNCA reordene migrations já existentes.
// ──────────────────────────────────────────────────────────────────────────────
import { Migration001_InitialTables }       from '../versions/001_InitialTables';
import { Migration002_BankAccount }         from '../versions/002_AlteracoesBankAccount';
import { Migration016_Modulos }             from '../versions/016_Modulos';
import { Migration017_SuperAdminSaas }      from '../versions/017_SuperAdminSaas';

export const MIGRATION_REGISTRY: IMigration[] = [
  new Migration001_InitialTables(),
  new Migration002_BankAccount(),
  new Migration016_Modulos(),
  new Migration017_SuperAdminSaas(),
  // → adicione novas migrations aqui, sempre ao final
];
