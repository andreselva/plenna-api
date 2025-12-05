import { Test, TestingModule } from '@nestjs/testing';
import { ClientModulesController } from './client-modules.controller';

describe('ClientModulesController', () => {
  let controller: ClientModulesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientModulesController],
    }).compile();

    controller = module.get<ClientModulesController>(ClientModulesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
