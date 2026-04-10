import { Test, TestingModule } from '@nestjs/testing';
import { ManagementService } from './management.service';
import { UsersService } from './Users/UserService';
import { ClientsService } from './clients/clients.service';
import { AuthContextService } from '../Auth/auth-context.service';

describe('ManagementService', () => {
  let service: ManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ManagementService,
        {
          provide: UsersService,
          useValue: {
            createUser: jest.fn(),
          },
        },
        {
          provide: ClientsService,
          useValue: {
            createClient: jest.fn(),
          },
        },
        {
          provide: AuthContextService,
          useValue: {
            getClientId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ManagementService>(ManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
