import { Test, TestingModule } from '@nestjs/testing';
import { SaasController } from './saas.controller';

describe('SaasController', () => {
  let controller: SaasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SaasController],
    }).compile();

    controller = module.get<SaasController>(SaasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
