import { Test, TestingModule } from '@nestjs/testing';
import { MerchantUserService } from './merchant-user.service';

describe('MerchantUserService', () => {
  let service: MerchantUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MerchantUserService],
    }).compile();

    service = module.get<MerchantUserService>(MerchantUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
