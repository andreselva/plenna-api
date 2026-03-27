import { Test, TestingModule } from '@nestjs/testing';
import { InvoicesService } from './invoices.service';
import CreateInvoiceUseCase from './UseCases/CreateInvoiceUseCase';
import GetInvoicesUseCase from './UseCases/GetInvoicesUseCase';
import UpdateStatusInvoice from './UseCases/UpdateStatusInvoice';

describe('InvoicesService', () => {
  let service: InvoicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        {
          provide: CreateInvoiceUseCase,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: GetInvoicesUseCase,
          useValue: {
            get: jest.fn(),
            getRelatedInvoiceBankAccount: jest.fn(),
          },
        },
        {
          provide: UpdateStatusInvoice,
          useValue: {
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
