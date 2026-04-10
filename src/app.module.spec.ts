import { MODULE_METADATA } from '@nestjs/common/constants';
import { AppModule } from './app.module';
import { BillingModule } from './modules/billing/billing.module';
import { LedgerModule } from './modules/Finance/core/ledger/ledger.module';
import { FinanceModule } from './modules/Finance/finance.module';

describe('AppModule', () => {
  it('registers required modules in root imports', () => {
    const imports = Reflect.getMetadata(MODULE_METADATA.IMPORTS, AppModule) as unknown[];

    const required = [
      BillingModule,
      FinanceModule,
      LedgerModule,
    ];

    for (const module of required) {
      expect(imports).toContain(module);
    }
  });
});