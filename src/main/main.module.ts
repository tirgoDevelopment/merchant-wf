import { Module } from "@nestjs/common";
import { MerchantsModule } from "./merchants/merchant.module";
import { TransactionsModule } from "./transaction/transaction.module";
import { MerchantUserModule } from './merchant-user/merchant-user.module';
import { OrdersModule } from "./orders/orders.module";

@Module({
    imports: [
        MerchantsModule,
        MerchantUserModule,
        TransactionsModule,
        OrdersModule
    ],
    controllers: [
    ],
    providers: [
    ],
    exports: [
        MerchantsModule,
        MerchantUserModule,
        TransactionsModule,
        OrdersModule
    ]
})
export class MainModule {
}