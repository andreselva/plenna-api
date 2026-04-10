import { Test, TestingModule } from '@nestjs/testing';
import { ChargesController } from './charges.controller';
import { ChargesService } from './charges.service';

describe('ChargesController', () => {
  let controller: ChargesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChargesController],
      providers: [
        {
          provide: ChargesService,
          useValue: { create: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<ChargesController>(ChargesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
