import { Test, TestingModule } from '@nestjs/testing';
import { FinancialEventsController } from './financial-events.controller';

describe('FinancialEventsController', () => {
  let controller: FinancialEventsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FinancialEventsController],
    }).compile();

    controller = module.get<FinancialEventsController>(FinancialEventsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
