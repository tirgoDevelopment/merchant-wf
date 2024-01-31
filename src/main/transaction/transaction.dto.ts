import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class TransactionDto {

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  // @IsNumber()
  // @IsNotEmpty()
  taxAmount: number;

  // @IsNumber()
  // @IsNotEmpty()
  additionalAmount: number;

  @IsString()
  @IsNotEmpty()
  transactionType: string;

  @IsString()
  @IsNotEmpty()
  userType: string;

  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  comment: string;

  id?: number;

}