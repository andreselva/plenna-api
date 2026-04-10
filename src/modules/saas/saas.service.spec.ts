import { Test, TestingModule } from '@nestjs/testing';
import { SaasService } from './saas.service';
import SaasRepository from './saas.repository';
import RedisService from '../redis/redis-service';

describe('SaasService', () => {
  let service: SaasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SaasService,
        {
          provide: SaasRepository,
          useValue: {
            getTenants: jest.fn(),
            getTenant: jest.fn(),
            getTenantModules: jest.fn(),
            getUsersAdminFromClientId: jest.fn(),
            getSubmodules: jest.fn(),
            disableModules: jest.fn(),
            saveClient: jest.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: {
            deletePattern: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SaasService>(SaasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
