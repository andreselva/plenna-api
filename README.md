<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/BullMQ-FF0000?style=for-the-badge&logo=bull&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
</p>

<h1 align="center">Plenna API</h1>

<p align="center">
  Plataforma financeira para pequenas e médias empresas de serviços.<br/>
  Gestão de cobranças, controle de fluxo de caixa e inteligência financeira — construída do zero com foco em domínio.
</p>

---

## Sobre o projeto

A **Plenna API** é o back-end de uma plataforma SaaS financeira voltada para negócios de serviço. O sistema centraliza o controle de despesas, receitas, faturas de cartão de crédito, cobranças, contas bancárias e lançamentos contábeis automatizados, com suporte a múltiplos tenants, relatórios com IA e processamento assíncrono.

O projeto nasceu de uma necessidade real: profissionais autônomos e pequenas empresas de serviço convivem com ferramentas financeiras genéricas que não refletem como seu negócio funciona. A Plenna foi construída ao redor do ciclo de **cobrança → pagamento → lançamento contábil** — o coração da operação financeira desse perfil de usuário.

> **Nota:** este repositório está arquivado. O projeto foi encerrado e é mantido aqui como referência de estudo e portfólio.

---

## Arquitetura

### Stack

| Camada | Tecnologia |
|---|---|
| Framework | NestJS 11 + TypeScript |
| Banco de dados | MySQL 8 — driver `mysql2`, **queries nativas** sem ORM |
| Cache & Filas | Redis 7 + **BullMQ** |
| Autenticação | JWT (access + refresh tokens) via cookies `HttpOnly` |
| E-mail | Nodemailer / AWS SES com templates **Handlebars** |
| Inteligência Artificial | OpenAI API (relatórios e categorização) |
| Infraestrutura | Docker, Railway |

### Estrutura de camadas

```
src/
├── common/           # Guards, interceptors, filters e decorators globais
├── EntityModels/     # Entidades de domínio (mapeamento banco ↔ objeto)
├── Shared/
│   ├── interfaces/   # Contratos: IEntity, IEntityFactory, IRow*
│   ├── mapper/       # DataMapper
│   ├── QueryBuilder/ # QueryBuilder dinâmico para SQL nativo
│   └── Repositories/ # BaseRepository — lógica comum de persistência
├── migrations/       # Sistema de migrations customizado
├── modules/
│   ├── Auth/         # Autenticação, JWT, AuthContextService
│   ├── Finance/      # Núcleo financeiro (Expense, Revenue, Invoice, Payment...)
│   │   └── core/     # LedgerEngine, LedgerBuilder, FinancialEventsService
│   ├── Dashboard/    # Consolidações e KPIs
│   ├── reports/      # Relatórios com IA
│   ├── appointments/ # Agendamentos recorrentes
│   ├── email/        # Fila de e-mails
│   └── saas/         # Administração multi-tenant
└── workers/          # Workers BullMQ independentes (email, appointments)
```

### Pipeline de uma requisição

```
LoggerMiddleware
  → GlobalAuthGuard  (JWT + validação de CSRF + origin)
    → RolesGuard
      → ValidationPipe  (class-validator)
        → Controller → UseCase → Repository
          → ResponseInterceptor  (envelope padrão de resposta)
          → AllExceptionsFilter  (tratamento unificado de erros)
```

---

## Destaques técnicos

### Subsistema de Ledger (Contabilidade de Partidas Dobradas)

O ponto mais elaborado da arquitetura. Qualquer evento financeiro — pagamento de despesa, recebimento de receita, liquidação de fatura — atravessa o `LedgerEngine` antes de ser confirmado.

```
PaymentService
  → FinancialEventsService   # cria o evento com hash SHA-256 encadeado
    → LedgerEngine           # garante idempotência e delega ao builder
      → LedgerBuilder        # gera o par de entradas (débito + crédito)
        → LedgerRepository   # persiste as duas entradas atomicamente
```

- **Idempotência real:** cada evento possui um hash encadeado ao anterior, armazenado em `ledger_event_processing`. Um evento duplicado lança `EventAlreadyProcessedException` antes de qualquer escrita.
- **Partidas dobradas:** toda movimentação gera exatamente dois `LedgerEntry` — origem e destino — garantindo integridade contábil.
- **Sequência garantida via Redis:** um contador atômico no Redis garante que eventos do mesmo tenant nunca colidirem em sequência.

### QueryBuilder e acesso a dados sem ORM

A decisão de não usar um ORM foi intencional. O projeto possui um `QueryBuilder` próprio que constrói `INSERT` e `UPDATE` dinâmicos a partir das propriedades da entidade, respeitando os campos declarados em `ignoredProperties` — campos calculados ou relações que existem em memória mas não no banco.

Toda entidade de domínio:
- Estende `EntityModel`
- Implementa `IEntity` (`getTableName`, `getPrimaryKey`, `getIgnoredProperties`)
- Expõe um método estático `fromRow(row)`, consumido pelo `DataMapper`

O `BaseRepository<T>` centraliza `save()` (INSERT/UPDATE dinâmico), `extractToEntity()` e o preenchimento automático de `clientId` via `AuthContextService` — o que garante isolamento de tenant em toda operação de escrita, sem que nenhum use case precise se preocupar com isso.

### Autenticação e multi-tenancy

- JWT com **access token + refresh token** em cookies `HttpOnly` e `Secure`
- `AuthContextService` com escopo `REQUEST` injeta `clientId` e `userId` em toda a cadeia de execução
- `GlobalAuthGuard` combina validação de JWT, checagem de `Origin` e CSRF
- `RolesGuard` com decorator `@Roles()` para controle de acesso por perfil (`OWNER`, `EMPLOYEE`, `SUPER_ADMIN`)
- Rate limiting específico na rota de autenticação via `AuthRateLimitGuard`

### Sistema de Migrations customizado

O sistema suporta:

- **Fases de deploy:** `before-deploy` e `execute` — permite migrações seguras em ambientes com zero downtime
- **Processadores discriminados:** `RunSQL` (DDL direto), `RunScript` (TypeScript executável), `RunEffect` (efeito com acesso a serviços)
- **Execução transacional** com rollback automático em caso de falha
- Registro de todas as migrações aplicadas com timestamp

### Processamento assíncrono com BullMQ

Workers completamente independentes do processo da API principal:

- **Email Worker:** processa jobs de envio de e-mail com templates Handlebars; suporta modo fake para testes
- **Appointments Worker:** dispara cobranças e notificações recorrentes baseadas em regras de agendamento

Cada worker se conecta ao Redis de forma isolada e processa jobs por nome, permitindo múltiplos tipos de tarefa na mesma fila.

### Relatórios com Inteligência Artificial

Integração com a OpenAI API para geração de análises financeiras em linguagem natural, categorizações assistidas e insights sobre o fluxo de caixa do tenant.

---

## Módulo Finance

O coração do sistema. Organizado em submódulos independentes:

| Módulo | Responsabilidade |
|---|---|
| `Expenses` | CRUD de despesas, atualização de status, guard de conta |
| `Revenues` | CRUD de receitas, vinculação a cobranças |
| `Invoices` | Faturas de cartão de crédito, import CSV/OFX |
| `Payment` | Registro de pagamentos — ponto de entrada do Ledger |
| `BankAccounts` | Contas bancárias com proteção de mutação pós-evento |
| `CreditCards` | Cartões de crédito |
| `core/ledger` | LedgerEngine, LedgerBuilder — **interno, sem endpoints** |
| `core/financial-events` | FinancialEventsService — **interno, sem endpoints** |

---

## Padrões e convenções

- **Use Cases explícitos:** toda operação de negócio é uma classe com responsabilidade única (ex: `CreateExpense`, `RegisterPayment`, `UpdateStatusInvoice`)
- **Resposta padronizada:** o `ResponseInterceptor` envolve toda resposta bem-sucedida em `{ payload, message }`
- **Erros de domínio tipados:** exceções como `EventAlreadyProcessedException` carregam semântica do domínio, não apenas status HTTP
- **Separação de concerns no Ledger:** `LedgerEngine` orquestra, `LedgerBuilder` resolve tipos contábeis — responsabilidades distintas em classes distintas
- **SOLID na prática:** interfaces como `IEntityFactory` e `IGatewayFactory` garantem inversão de dependência nos pontos de extensão

---

## Contexto

A Plenna foi encerrada como produto, mas o código permanece como registro honesto de um processo de aprendizado real. Algumas fronteiras de domínio ficaram abertas — em particular, a inversão arquitetural onde `Charge` assumiria o papel central e `Revenue` passaria a ser uma consequência dela, e não o contrário. Essa decisão estava mapeada, foi pensada e documentada, mas não chegou a ser implementada completamente.

Esse tipo de inacabamento é parte do que o projeto representa: decisões arquiteturais conscientes tomadas no meio de um sistema real, com histórico de dados e tradeoffs visíveis.

É o projeto onde mais pensei sobre software.

---

## Como executar

```bash
# Instalar dependências
npm install

# Subir ambiente local (MySQL + Redis)
docker-compose up -d

# Executar migrations
npm run migration:run

# Iniciar a API
npm run start:dev

# Iniciar os workers (processo separado)
npm run worker:email
npm run worker:appointments
```

---

<p align="center">
  Feito com muito pensamento e alguns arrependimentos arquiteturais.<br/>
  <em>André — Bento Gonçalves, RS</em><br/>
  <em>Projeto encerrado em 14/04/2026.</em>
</p>