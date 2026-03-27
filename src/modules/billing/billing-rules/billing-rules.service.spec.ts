import { Test, TestingModule } from '@nestjs/testing';
import { BillingRulesService } from './billing-rules.service';

describe('BillingRulesService', () => {
  let service: BillingRulesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BillingRulesService],
    }).compile();

    service = module.get<BillingRulesService>(BillingRulesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
