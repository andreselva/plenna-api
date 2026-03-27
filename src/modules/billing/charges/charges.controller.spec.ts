import { Test, TestingModule } from '@nestjs/testing';
import { ChargesController } from './charges.controller';

describe('ChargesController', () => {
  let controller: ChargesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChargesController],
    }).compile();

    controller = module.get<ChargesController>(ChargesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
