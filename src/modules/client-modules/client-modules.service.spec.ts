import { Test, TestingModule } from '@nestjs/testing';
import { ClientModulesService } from './client-modules.service';

describe('ClientModulesService', () => {
  let service: ClientModulesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientModulesService],
    }).compile();

    service = module.get<ClientModulesService>(ClientModulesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
