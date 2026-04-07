# Plenna API — Contexto

API financeira de cobranças. NestJS + TypeScript, MySQL (queries nativas, sem ORM), Redis, BullMQ.

## Padrões obrigatórios

- Toda entidade estende `EntityModel`, implementa `IEntity` (`getTableName`, `getPrimaryKey`, `getIgnoredProperties`) e tem método estático `fromRow(row)`.
- `ignoredProperties` exclui do `QueryBuilder` campos calculados ou relações em memória.
- `BaseRepository<T>` centraliza `save()` (INSERT/UPDATE dinâmico) e `extractToEntity()`. Todo módulo novo deve ter entidade + repositório estendendo a base.
- `AuthContextService` (escopo REQUEST) fornece `clientId` e `userId`. O `BaseRepository` preenche `clientId` automaticamente em todo `save()`.
- Módulos expõem controllers com raras exceções: `FinancialEvents` e `Ledger` são internos.

## Domínio

A entidade central é `Charge` (em construção na branch `gateways`). O `master` atual ainda gira em torno de `Expense`/`Revenue`, mas a direção é inverter: `Charge` como origem, `Revenue` como consequência.

Entidades existentes: `Expense`, `Revenue`, `Invoice`, `Payment` (polimórfico via `payable_type`/`payable_id`), `BankAccount`, `CreditCard`, `FinancialEvents`, `LedgerEntry`.

## Fluxo de pagamento (atual)

```
PaymentService → FinancialEventsService (cria evento com hash encadeado)
              → LedgerEngine.process() (idempotência + double-entry)
              → updateStatus() (Expense / Revenue / Invoice)
```

## Ledger

Subsistema interno. Não expõe endpoints.

- `FinancialEventsService`: cria eventos com sequência (Redis) e hash SHA-256 encadeado.
- `LedgerEngine`: valida, garante idempotência via `ledger_event_processing`, delega ao `LedgerBuilder`, valida par de entradas, persiste.
- `LedgerBuilder`: gera par de `LedgerEntry` (origin + destination) por evento. **Pendência:** instancia `LedgerBuilder` com `new` (viola DIP) e acumula lógica de resolução de contas que deve migrar para um `LedgerResolver`.
- `EventAlreadyProcessedException`: lançada em duplicata de evento (unique key no banco).