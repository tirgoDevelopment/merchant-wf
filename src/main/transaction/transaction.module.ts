import { Module } from "@nestjs/common";
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsController } from "./transaction.controller";
import { Transaction, User } from "..";
import { TransactionService } from "./transaction.service";
import { SharedModule } from "src/shared/modules/shared.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Transaction, User]),
        SharedModule
    ],
    controllers: [
        TransactionsController
    ],
    providers: [
        TransactionService
    ],
    exports: [
        TypeOrmModule.forFeature([Transaction]),
    ]
})
export class TransactionsModule {

}