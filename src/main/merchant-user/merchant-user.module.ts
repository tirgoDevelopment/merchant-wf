import { Module } from '@nestjs/common';
import { MerchantUserController } from './merchant-user.controller';
import { MerchantUserService } from './merchant-user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Merchant, MerchantUser, User } from '..';
import { MerchantsModule } from '../merchants/merchant.module';
import { SharedModule } from 'src/shared/modules/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MerchantUser, User, Merchant]),
    MerchantsModule,
    SharedModule
  ],
  controllers: [MerchantUserController],
  providers: [MerchantUserService],
  exports: [
    TypeOrmModule.forFeature([MerchantUser, User, Merchant]),
    MerchantUserService
  ]
})
export class MerchantUserModule {}
