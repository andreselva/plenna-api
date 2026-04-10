import { Test, TestingModule } from '@nestjs/testing';
import { BankAccountsService } from './bank-accounts.service';
import { BankAccountsRepository } from './bank-accounts.repository';
import { FinancialEventsService } from '../financial-events/financial-events.service';
import { LedgerEngine } from '../ledger/ledger.engine';
import MySQLDatabase from 'src/modules/Config/Database/MySQLDatabase';

describe('BankAccountsService', () => {
  let service: BankAccountsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BankAccountsService,
        {
          provide: BankAccountsRepository,
          useValue: {
            listBankAccounts: jest.fn(),
            save: jest.fn(),
            inactiveBankAccount: jest.fn(),
          },
        },
        {
          provide: FinancialEventsService,
          useValue: {
            register: jest.fn(),
          },
        },
        {
          provide: LedgerEngine,
          useValue: {
            process: jest.fn(),
          },
        },
        {
          provide: MySQLDatabase,
          useValue: {
            transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BankAccountsService>(BankAccountsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
