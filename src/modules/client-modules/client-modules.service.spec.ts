import { Test, TestingModule } from '@nestjs/testing';
import { ClientModulesService } from './client-modules.service';
import ClientModulesRepository from './client-modules.repository';
import { AuthContextService } from '../Auth/auth-context.service';
import RedisService from '../redis/redis-service';

describe('ClientModulesService', () => {
  let service: ClientModulesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientModulesService,
        {
          provide: ClientModulesRepository,
          useValue: {
            getModuleTreeForSuperAdmin: jest.fn(),
            getModulesByUserId: jest.fn(),
          },
        },
        {
          provide: AuthContextService,
          useValue: {
            getClientId: jest.fn(),
            getUserId: jest.fn(),
            getRole: jest.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ClientModulesService>(ClientModulesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
