import { Test, TestingModule } from '@nestjs/testing';
import { GatewaysService } from './gateways.service';

describe('GatewaysService', () => {
  let service: GatewaysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GatewaysService],
    }).compile();

    service = module.get<GatewaysService>(GatewaysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
