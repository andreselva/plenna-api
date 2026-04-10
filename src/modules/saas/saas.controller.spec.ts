import { Test, TestingModule } from '@nestjs/testing';
import { SaasController } from './saas.controller';
import { SaasService } from './saas.service';

describe('SaasController', () => {
  let controller: SaasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SaasController],
      providers: [
        {
          provide: SaasService,
          useValue: {
            getTenants: jest.fn(),
            getTenant: jest.fn(),
            saveClientModules: jest.fn(),
            saveClient: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SaasController>(SaasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
