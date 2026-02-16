import { Test, TestingModule } from '@nestjs/testing';
import { SaasService } from './saas.service';

describe('SaasService', () => {
  let service: SaasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SaasService],
    }).compile();

    service = module.get<SaasService>(SaasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
