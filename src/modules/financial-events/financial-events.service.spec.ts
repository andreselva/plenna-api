import { Test, TestingModule } from '@nestjs/testing';
import { FinancialEventsService } from './financial-events.service';

describe('FinancialEventsService', () => {
  let service: FinancialEventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FinancialEventsService],
    }).compile();

    service = module.get<FinancialEventsService>(FinancialEventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
