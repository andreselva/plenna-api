import { Test, TestingModule } from '@nestjs/testing';
import { BillingRulesService } from './billing-rules.service';
import { BillingRulesRepository } from './billing-rules.repository';

describe('BillingRulesService', () => {
  let service: BillingRulesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingRulesService,
        {
          provide: BillingRulesRepository,
          useValue: {
            loadBillingRuleByPaymentMethodAndCustomer: jest.fn(),
            loadDefaultBillingRuleByPaymentMethod: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BillingRulesService>(BillingRulesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
