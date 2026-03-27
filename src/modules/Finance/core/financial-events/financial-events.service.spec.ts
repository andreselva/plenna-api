import { Test, TestingModule } from '@nestjs/testing';
import { FinancialEventsService } from './financial-events.service';
import { AuthContextService } from 'src/modules/Auth/auth-context.service';
import RedisService from 'src/modules/redis/redis-service';
import { FinancialEventsRepository } from './financial-events.repository';

describe('FinancialEventsService', () => {
  let service: FinancialEventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinancialEventsService,
        {
          provide: AuthContextService,
          useValue: {
            getClientId: jest.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            incr: jest.fn(),
          },
        },
        {
          provide: FinancialEventsRepository,
          useValue: {
            saveEvent: jest.fn(),
            getMaxSequenceNumber: jest.fn(),
            getLastEventHash: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FinancialEventsService>(FinancialEventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
