# Build do Ledger

## Estado atual

O projeto mantém apenas uma camada de build materializado:

- `ledger_monthly_builds`

O antigo `ledger_builds` foi removido porque só repetia snapshots do estado corrente, sem recorte temporal, e podia ser substituído por consultas diretas ou pelo registro mensal aberto.

## O que fica fora do build

Consultas simples de estado atual não devem ser materializadas:

- pendências atuais de `expense`
- pendências atuais de `revenue`
- totais correntes que podem ser obtidos com query direta e índice adequado

Esses dados podem ser buscados síncronamente quando o custo for baixo.

## O que faz sentido no build

O `ledger_monthly_builds` guarda dados com significado temporal:

- agregados de eventos por tipo dentro do mês
- posição mensal de cobranças em aberto
- pendências correntes do período
- saldo de fechamento do período anterior

O registro do mês corrente é atualizado por `upsert`. Quando o mês vira, os períodos anteriores são fechados com `closedAt` e `closingBalance`.

## Regras de modelagem

- fonte da verdade de eventos: `financial_events`
- fonte da verdade de snapshots de saldo: `ledger_snapshots`
- materialização histórica: `ledger_monthly_builds`

Regra prática:

- estado atual simples: query direta
- histórico por período: build
- fotografia de fechamento: build

## Estrutura principal

### Tabela `ledger_monthly_builds`

```sql
id, clientId,
period VARCHAR(7) NOT NULL,
closedAt DATETIME NULL,
closingBalance DECIMAL(15,2) NULL,
openChargesCount INT UNSIGNED NOT NULL DEFAULT 0,
openChargesValue DECIMAL(15,2) NOT NULL DEFAULT 0,
pendingExpenses DECIMAL(15,2) NOT NULL DEFAULT 0,
pendingRevenues DECIMAL(15,2) NOT NULL DEFAULT 0,
buildData JSON NOT NULL,
builtAt DATETIME NOT NULL,
createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
UNIQUE KEY (clientId, period)
```

### `buildData`

```json
{
  "events": {
    "paymentPosted": { "count": 0, "totalAmount": 0 },
    "transferPosted": { "count": 0, "totalAmount": 0 },
    "transferReceived": { "count": 0, "totalAmount": 0 },
    "reversal": { "count": 0, "totalAmount": 0 },
    "openingBalance": { "count": 0, "totalAmount": 0 },
    "revenueReceived": { "count": 0, "totalAmount": 0 },
    "chargeGenerated": { "count": 0, "totalAmount": 0 },
    "chargePaid": { "count": 0, "totalAmount": 0 },
    "chargeCanceled": { "count": 0, "totalAmount": 0 },
    "chargeExpired": { "count": 0, "totalAmount": 0 },
    "chargeRefunded": { "count": 0, "totalAmount": 0 },
    "revenueRecognized": { "count": 0, "totalAmount": 0 },
    "expenseRecognized": { "count": 0, "totalAmount": 0 }
  }
}
```

## Fluxo

### Agendamento automático

- appointment interno `ledger-monthly-build`
- recorrência diária às 03:00
- uma agenda por cliente ativo

### Rebuild sob demanda

- `POST /ledger-monthly-build/rebuild`
- agenda um job único com delay curto para o cliente atual

## Padrão de código

O build mensal segue repository pattern:

- `LedgerMonthlyBuildService` orquestra o caso de uso
- `LedgerMonthlyBuildRepository` concentra persistência e queries agregadas
- não há builders intermediários para consultas simples

Isso reduz camadas artificiais e mantém as queries de build perto da persistência.
