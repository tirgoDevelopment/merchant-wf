import { Module } from "@nestjs/common";
import { TypeOrmModule } from '@nestjs/typeorm';
import { MerchantController } from "./merchant.controller";
import { MerchantService } from "./merchant.service";
import { TransactionsModule } from "../transaction/transaction.module";
import { SharedModule } from "src/shared/modules/shared.module";
import { BankAccount, Merchant, Order, Role, User } from "..";

@Module({
    imports: [
        TypeOrmModule.forFeature([Merchant,
            BankAccount,
            User,
            Role,
            Order]),
        TransactionsModule,
        SharedModule
    ],
    controllers: [
        MerchantController
    ],
    providers: [
        MerchantService
    ],
    exports: [
        TypeOrmModule.forFeature([Merchant]),
        MerchantService
    ]
})
export class MerchantsModule {

}