import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator";

export class OrderDto {

  id?: string;
  
  @IsString()
  @IsNotEmpty()
  loadingLocation: string;

  @IsString()
  @IsNotEmpty()
  deliveryLocation: string;

  @IsNotEmpty()
  @IsNumber()
  merchantId: number;

  cargoStatusId?: number;

  customsPlaceLocation?: string;
  customsClearancePlaceLocation?: string;
  additionalLoadingLocation?: string;
  isAdr?: boolean;
  isCarnetTir?: string;
  isGlonas?: boolean;
  isParanom?: boolean;
  offeredPrice?: number;
  paymentMethod?: string;
  inAdvancePrice?: number;
  offeredPriceCurrencyId: string;
  inAdvancePriceCurrencyId: string;
  refrigeratorFrom?: string;
  refrigeratorTo?: string;
  refrigeratorCount?: number;

  @IsDate()
  @IsNotEmpty()
  sendDate: Date;

  @IsBoolean()
  @IsNotEmpty()
  isSafeTransaction: boolean;

  @IsUUID()
  @IsNotEmpty()
  transportTypeId: string;

  @IsNotEmpty()
  transportKindIds: string[];

  @IsUUID()
  @IsNotEmpty()
  cargoTypeId: string;

  cargoWeight?: number;
  cargoLength?: number;
  cargiWidth?: number;
  cargoHeight?: number;
  volume?: number;

  loadingMethodId?: string;
  cargoPackageId?: string;
}