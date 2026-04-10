import { Test, TestingModule } from '@nestjs/testing';
import { ChargesService } from './charges.service';
import { ChargesRepository } from './charges.repository';
import { ChargesEngine } from './charges.engine';
import { ChargeGatewayService } from './charge-gateway.service';
import { FinancialEventsService } from 'src/modules/Finance/core/financial-events/financial-events.service';
import { ChargesFactory } from './factorys/charges.factory';
import MySQLDatabase from 'src/modules/Config/Database/MySQLDatabase';
import { ChargeEventsService } from './events/charge-events.service';

describe('ChargesService', () => {
  let service: ChargesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChargesService,
        {
          provide: ChargesRepository,
          useValue: {
            loadExpense: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: ChargesEngine,
          useValue: {
            process: jest.fn(),
          },
        },
        {
          provide: ChargeGatewayService,
          useValue: {
            sendCharge: jest.fn(),
          },
        },
        {
          provide: ChargesFactory,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: MySQLDatabase,
          useValue: {
            transaction: jest.fn(),
            commit: jest.fn(),
            rollback: jest.fn(),
          },
        },
        {
          provide: ChargeEventsService,
          useValue: {
            register: jest.fn(),
          },
        },
        {
          provide: FinancialEventsService,
          useValue: {
            register: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ChargesService>(ChargesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});