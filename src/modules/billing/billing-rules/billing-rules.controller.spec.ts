import { Test, TestingModule } from '@nestjs/testing';
import { BillingRulesController } from './billing-rules.controller';

describe('BillingRulesController', () => {
  let controller: BillingRulesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BillingRulesController],
    }).compile();

    controller = module.get<BillingRulesController>(BillingRulesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
