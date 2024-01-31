import { Module } from "@nestjs/common";
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from "src/shared/modules/shared.module";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { CargoLoadMethod, CargoPackage, CargoStatus, CargoType, Currency, Merchant, Order, TransportKind, TransportType } from "..";

@Module({
    imports: [
        TypeOrmModule.forFeature([Order,
            Merchant,
            Currency,
            CargoType,
            CargoStatus,
            CargoPackage,
            TransportKind,
            TransportType,
            CargoLoadMethod]),
        SharedModule
    ],
    controllers: [
        OrdersController,
    ],
    providers: [
        OrdersService,
    ],
    exports: [
        TypeOrmModule.forFeature([Order]),
        OrdersService
    ]
})
export class OrdersModule {

}