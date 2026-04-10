import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import FinancialSummaryService from './FinancialSummary/FinancialSummaryService';

describe('ReportsService', () => {
  let service: ReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: FinancialSummaryService,
          useValue: {
            process: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
