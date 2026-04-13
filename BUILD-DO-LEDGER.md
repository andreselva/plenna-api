# Build do Ledger — Contexto para Claude

## O que é

Sistema de snapshots financeiros pré-calculados para dashboards e relatórios. Roda como tarefa interna BullMQ, persiste resultado no banco. Existe para evitar queries pesadas em tempo real.

---

## Implementação atual (Camada 1 — Estado atual)

### Arquivos criados

```
src/
  enum/recurrence.enum.ts                          ← DAILY_03 adicionado ('0 3 * * *')
  Shared/interfaces/ILedgerBuild.ts
  EntityModels/ledger-build.ts
  migrations/versions/Migration20260412_05_CriaTabelaLedgerBuilds.ts
  modules/
    appointments/
      appointment.base.ts                          ← case DAILY_03 adicionado
      appointments.module.ts                       ← LedgerBuildModule + LedgerBuildAppointment registrados
      definitions/ledger-build.appointment.ts      ← id=4, type='ledger-build', DAILY_03, isInternal=true
    Finance/core/ledger-build/
      builders/
        bank-balance.builder.ts                    ← ledger_entries WHERE liquidity=1 GROUP BY accountId
        payment-posted.builder.ts                  ← financial_events WHERE type='PAYMENT_POSTED'
        transfer-posted.builder.ts
        transfer-received.builder.ts
        reversal.builder.ts
        opening-balance.builder.ts
        revenue-received.builder.ts
        charge-generated.builder.ts
        charge-paid.builder.ts
        charge-canceled.builder.ts
        charge-expired.builder.ts
        charge-refunded.builder.ts
        revenue-recognized.builder.ts
        expense-recognized.builder.ts
        pending-expenses.builder.ts                ← expense WHERE status IN ('pending','partial')
        pending-revenues.builder.ts                ← revenue WHERE status IN ('pending','partial')
      types/builder-result.type.ts                 ← EventBuilderResult, BankBalanceBuilderResult, PendingItemsResult
      ledger-build.controller.ts                   ← POST /ledger-build/rebuild → 202
      ledger-build.module.ts                       ← importa RedisModule, registra APPOINTMENTS_QUEUE_TOKEN próprio
      ledger-build.repository.ts
      ledger-build.service.ts
  workers/appointments/
    ledger-build.initializer.ts
    appointments-worker.module.ts                  ← LedgerBuildModule + LedgerBuildInitializer registrados
  app.module.ts                                    ← LedgerBuildModule registrado
```

### Tabela `ledger_builds`

```sql
id, clientId, builtAt DATETIME,
totalLiquidBalance DECIMAL(15,2),
openChargesCount INT UNSIGNED, openChargesValue DECIMAL(15,2),
pendingExpensesCount INT UNSIGNED, pendingExpensesValue DECIMAL(15,2),
pendingRevenuesCount INT UNSIGNED, pendingRevenuesValue DECIMAL(15,2),
buildData JSON,   -- breakdown completo (ver estrutura abaixo)
createdAt DATETIME
INDEX idx_client_built (clientId, builtAt)
```

### Estrutura do `buildData`

```json
{
  "bankBalance": { "totalLiquidBalance": 0, "byAccount": [{ "accountId": 0, "balance": 0 }] },
  "events": {
    "paymentPosted":       { "count": 0, "totalAmount": 0 },
    "transferPosted":      { "count": 0, "totalAmount": 0 },
    "transferReceived":    { "count": 0, "totalAmount": 0 },
    "reversal":            { "count": 0, "totalAmount": 0 },
    "openingBalance":      { "count": 0, "totalAmount": 0 },
    "revenueReceived":     { "count": 0, "totalAmount": 0 },
    "chargeGenerated":     { "count": 0, "totalAmount": 0 },
    "chargePaid":          { "count": 0, "totalAmount": 0 },
    "chargeCanceled":      { "count": 0, "totalAmount": 0 },
    "chargeExpired":       { "count": 0, "totalAmount": 0 },
    "chargeRefunded":      { "count": 0, "totalAmount": 0 },
    "revenueRecognized":   { "count": 0, "totalAmount": 0 },
    "expenseRecognized":   { "count": 0, "totalAmount": 0 }
  },
  "pending": {
    "expenses": { "count": 0, "totalValue": 0 },
    "revenues":  { "count": 0, "totalValue": 0 }
  }
}
```

### Rebuild sob demanda

`POST /ledger-build/rebuild` → `LedgerBuildService.scheduleRebuild()` → `queue.add('ledger-build', payload, { jobId: 'ledger-build:rebuild:{clientId}', delay: 2min })`. Deduplicação automática por `jobId` enquanto o job está no estado delayed/waiting.

### Padrão de módulo sem dependência circular

`LedgerBuildModule` importa `RedisModule` e registra `APPOINTMENTS_QUEUE_TOKEN` próprio via `createQueue`. NÃO importa `AppointmentsModule`. `AppointmentsModule` importa `LedgerBuildModule` para obter `LedgerBuildService` (necessário para `LedgerBuildAppointment`).

---

## Problemas conhecidos na implementação atual

### 1. Os 13 builders de evento não têm filtro de data

`SELECT COUNT(*), SUM(amount) FROM financial_events WHERE clientId = ? AND type = ?` acumula desde o início da conta. O número só cresce e não tem significado útil para dashboard. Isso foi identificado e a correção planejada é removê-los do build de estado atual e movê-los para o build mensal com filtro de período.

### 2. `BankBalanceBuilder` escaneia `ledger_entries` diretamente

Deveria consumir `ledger_snapshots` (já existe, mantido pelo `LedgerSnapshotService`). `ledger_snapshots` tem `balance` por `accountId` atualizado incrementalmente — não é necessário reprocessar `ledger_entries`.

**Refatoração planejada:**
```sql
SELECT accountId, balance
FROM ledger_snapshots ls
WHERE clientId = ?
  AND id = (SELECT MAX(id) FROM ledger_snapshots WHERE clientId = ls.clientId AND accountId = ls.accountId)
```

### 3. `openChargesCount/Value` calculado por delta de eventos

`gerado - pago - cancelado - expirado` funciona matematicamente mas é frágil. Quando a entidade `Charge` estiver disponível no master (hoje está na branch `gateways`), substituir por query direta na tabela `charges` com filtro de status.

---

## Distinção arquitetural fundamental

### Métricas de fluxo
COUNT/SUM de eventos que ocorreram em um período. Podem ser recalculadas a qualquer momento para qualquer período passado com precisão total (fonte: `financial_events`, imutável).

Exemplos: `paymentPosted.count`, `chargeGenerated.totalAmount`

### Métricas de estado
Situação em um ponto no tempo. Se não capturadas no momento, não podem ser reconstruídas com precisão — o estado já mudou.

Exemplos: `totalLiquidBalance`, `pendingExpensesCount`, `openChargesCount`

**Consequência:** métricas de estado que precisam de histórico mensal devem ser fotografadas no último dia do mês. Métricas de fluxo podem ser calculadas retroativamente.

---

## Arquitetura em camadas planejada (não implementada)

### Camada 2 — `ledger_monthly_builds`

```sql
id, clientId,
period VARCHAR(7) NOT NULL,     -- 'YYYY-MM'
closedAt DATETIME NULL,         -- NULL = mês aberto; preenchido ao fechar
closingBalance DECIMAL(15,2),   -- estado fotografado no fechamento
openChargesCount INT, openChargesValue DECIMAL(15,2),
pendingExpenses DECIMAL(15,2), pendingRevenues DECIMAL(15,2),
buildData JSON,                 -- 13 builders de evento COM filtro de período
builtAt DATETIME, createdAt DATETIME,
UNIQUE KEY (clientId, period)
```

Roda diariamente via upsert no `period` corrente (MTD). No virar do mês, o registro anterior recebe `closedAt` e nunca mais é sobrescrito.

### Camada 3 — `ledger_build_snapshots`

```sql
id, clientId,
periodStart VARCHAR(7), periodEnd VARCHAR(7),   -- 'YYYY-MM'
granularity ENUM('QUARTERLY', 'YEARLY'),
buildData JSON,    -- soma de fluxos + média de estados dos monthly builds do período
createdAt DATETIME,
INDEX (clientId, periodStart, periodEnd)
```

Job mensal: busca `ledger_monthly_builds` com `period < hoje - 6 meses`, agrupa por trimestre/ano, cria snapshot, deleta os monthly builds comprimidos (decisão pendente).

### Índice necessário antes de implementar camada 2

```sql
-- Verificar se existe em financial_events antes de implementar monthly builders
INDEX idx_client_type_occurred (clientId, type, occurredAt)
```

---

## O que deve ser buildado vs. síncrono

| Dado | Build | Síncrono | Motivo |
|---|---|---|---|
| Saldo líquido (via `ledger_snapshots`) | Camada 1 | Possível | `ledger_snapshots` é rápido; build consolida |
| Cobranças em aberto | Camada 1 + 2 | Não | Derivação complexa ou tabela `charges` futura |
| Despesas/receitas pendentes | Camada 1 + 2 | Sim | Query simples e indexada em `expense`/`revenue` |
| Volume de eventos por tipo | Camada 2 apenas | Para ad-hoc | Sem data é inútil; com data é rápido mas pré-calcular habilita gráficos históricos |
| Saldo de encerramento mensal | Camada 2 | Não | Métrica de estado — deve ser fotografada |
| Série histórica >6 meses | Camada 3 | Não | Custo de recalcular todos os meses é alto |

---

## Decisões pendentes (definir antes de implementar camadas 2 e 3)

1. **Monthly build: diário com upsert ou só no fim do mês?** Diário dá MTD no dashboard.
2. **Granularidade do snapshot: trimestral ou anual após 6 meses?** Trimestral preserva sazonalidade.
3. **Deletar monthly builds após compressão?** Sim economiza; não permite re-processar.
4. **`EXPENSE_RECOGNIZED`/`REVENUE_RECOGNIZED` no monthly: volume bruto ou net (descontando pagamentos do mês)?** Net é mais útil mas requer NOT EXISTS cruzando com PAYMENT_POSTED por referenceId/referenceType.
5. **Migrar `openChargesCount` para tabela `charges` quando disponível no master.**

---

## Dependências externas relevantes

- `LedgerSnapshotService` / `LedgerSnapshotRepository` — em `src/modules/Finance/core/ledger/`; mantém `ledger_snapshots` com saldo incremental por conta. O build de estado atual deveria consumir daqui.
- `Charge` entity — em desenvolvimento na branch `gateways`; quando disponível, substituir cálculo de `openCharges` por delta de eventos.
- `FinancialEventsEnum` — `src/enum/financial-events.enum.ts`; 13 valores, todos cobertos pelos builders.
