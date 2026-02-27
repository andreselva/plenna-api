# Sistema de Migrations

Sistema de migrations próprio para controle de alterações no banco de
dados MySQL.

Cada alteração estrutural ou de dados relevantes vira um arquivo
TypeScript versionado automaticamente pelo nome da classe e executado
antes do deploy da aplicação.

------------------------------------------------------------------------

# Estrutura de pastas

    src/migrations/
    ├── cli/
    │   └── migration.cli.ts
    ├── core/
    │   ├── IMigration.ts
    │   ├── IMigrationStepProcessor.ts
    │   ├── IScript.ts
    │   ├── MigrationRepository.ts
    │   ├── MigrationRunner.ts
    │   └── MigrationSteps.ts
    ├── exceptions/
    │   ├── MigrationRepositoryException.ts
    │   └── RunSqlException.ts
    ├── processors/
    │   ├── RunSQL.ts
    │   ├── RunScript.ts
    │   └── RunEffect.ts
    ├── scripts/
    │   └── SeedAlgumaCoisaScript.ts
    └── versions/
        ├── Migration20260227_01_InitialTables.ts
        ├── Migration20260228_01_AddUserStatus.ts
        └── ...

⚠️ Não existe mais MigrationRegistry.ts.

------------------------------------------------------------------------

# Como funciona

1.  O MigrationRunner lê todos os arquivos da pasta versions/.
2.  Procura classes no padrão: MigrationYYYYMMDD_XX_Descricao
3.  Extrai automaticamente a versão do nome da classe.
4.  Ordena todas as migrations por versão.
5.  Consulta a tabela schema_migrations.
6.  Executa apenas as pendentes.
7.  Registra sucesso ou falha com checksum.

------------------------------------------------------------------------

# Padrão de versionamento

Formato obrigatório:

MigrationYYYYMMDD_XX_Descricao

Exemplo:

Migration20260228_01_AddUserStatus

Versão extraída:

20260228_01

Regex validado:

\^`\d{8}`{=tex}\_`\d{2}`{=tex}\$

------------------------------------------------------------------------

# Criando uma migration

``` ts
export class Migration20260228_01_AddUserStatus implements IMigration {

  readonly name = 'Adiciona coluna status na tabela user';

  execute(): IMigrationStepProcessor[] {
    return [
      MigrationSteps.RunSQL(`
        ALTER TABLE user
          ADD COLUMN IF NOT EXISTS status ENUM('active','inactive') NOT NULL DEFAULT 'active';
      `),
    ];
  }

  executeBeforeDeploy(): IMigrationStepProcessor[] {
    return [];
  }

  getDatabases(): Database[] {
    return [Database.RAILWAY];
  }

  isTransactional(): boolean {
    return false;
  }
}
```

------------------------------------------------------------------------

# Tipos de step

### RunSQL

Executa SQL puro (múltiplas statements suportadas).

### RunScript

Executa classe que implementa IScript usando mesma conexão.

### RunEffect

Executa efeito colateral customizado.

------------------------------------------------------------------------

# Fases do deploy

  Fase            Método
  --------------- -----------------------
  before-deploy   executeBeforeDeploy()
  execute         execute()

------------------------------------------------------------------------

# Transações

Use isTransactional():

-   true → apenas DML
-   false → qualquer DDL

------------------------------------------------------------------------

# Comandos

npm run migration:run\
npm run migration:before-deploy\
npm run migration:status\
npm run migration:dev

------------------------------------------------------------------------

# Tabela schema_migrations

Campos principais:

-   version
-   name
-   executed_at
-   checksum
-   success
-   failed_step
-   error_msg

------------------------------------------------------------------------

# Regras importantes

-   Nunca alterar version após executada
-   Não renomear classe de migration aplicada
-   Sempre usar padrão YYYYMMDD_XX
-   DDL → isTransactional = false
-   Scripts usam conexão recebida

------------------------------------------------------------------------

# Arquitetura interna

-   Auto-discovery
-   Extração de version do nome da classe
-   Ordenação automática
-   Checksum forte
-   Sem registry manual