import { Test, TestingModule } from '@nestjs/testing';
import { GatewaysService } from './gateways.service';
import { GatewaysFactory } from './gateways.factory';

describe('GatewaysService', () => {
  let service: GatewaysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GatewaysService,
        {
          provide: GatewaysFactory,
          useValue: {
            resolve: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GatewaysService>(GatewaysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
