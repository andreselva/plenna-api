import { Test, TestingModule } from '@nestjs/testing';
import { ChargesService } from './charges.service';
import { ChargesRepository } from './charges.repository';
import { ChargesEngine } from './charges.engine';
import { ChargeGatewayService } from './charge-gateway.service';

describe('ChargesService', () => {
  let service: ChargesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChargesService,
        {
          provide: ChargesRepository,
          useValue: { loadExpense: jest.fn(), save: jest.fn() },
        },
        {
          provide: ChargesEngine,
          useValue: { process: jest.fn() },
        },
        {
          provide: ChargeGatewayService,
          useValue: { sendCharge: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ChargesService>(ChargesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
