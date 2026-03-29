import { Test, TestingModule } from '@nestjs/testing';
import { BillingRulesController } from './billing-rules.controller';
import { BillingRulesService } from './billing-rules.service';

describe('BillingRulesController', () => {
  let controller: BillingRulesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BillingRulesController],
      providers: [
        {
          provide: BillingRulesService,
          useValue: {
            getBillingRuleByPaymentMethodAndCustomer: jest.fn(),
            getDefaultBillingRuleByPaymentMethod: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BillingRulesController>(BillingRulesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
