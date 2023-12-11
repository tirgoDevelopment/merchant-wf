
import { IsNotEmpty, IsUUID } from "class-validator";
import { PrimaryGeneratedColumn } from "typeorm";

export class CargoDto {

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @IsNotEmpty()
  sendLocation: string;

  cargoDeliveryLocation?: string;

  @IsUUID()
  @IsNotEmpty()
  transportTypeId: string;
 
  @IsUUID()
  @IsNotEmpty()
  cargoTypeId: string;

  @IsNotEmpty()
  sendCargoDate: Date;
  
  @IsNotEmpty()
  sendCargoTime: string;

  @IsNotEmpty()
  merchantId: number;

  @IsUUID()
  currencyId?: string;

  isSafe?: boolean;
  offeredPrice?: number;
  cargoWeight?: number;
  cargoLength?: number;
  cargoWidth?: number;
  cargoHeight?: number;
  isDangrousCargo?: boolean;
  isCashlessPayment?: boolean
  isUrgent?: boolean;

}

export class AcceptCargoDto {
  @IsNotEmpty()
  orderId: number;

  @IsNotEmpty()
  clientId: number;

  @IsNotEmpty()
  driverId: number;

  @IsNotEmpty()
  amount: number;

  @IsNotEmpty()
  isSafe: boolean;

  @IsNotEmpty()
  additionalAmount: number;

}