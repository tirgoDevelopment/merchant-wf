
import { IsEmail, IsNotEmpty, IsUUID } from "class-validator";

export class CreateMerchantUserDto {

  @IsNotEmpty()
  fullName: string;

  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  merchantId: number;

  @IsNotEmpty()
  @IsUUID()
  role: string;

  @IsNotEmpty()
  password: string;

  // @IsEmail()
  // @IsNotEmpty()
  phoneNumber?: string;
}

export class UpdateMerchantUserDto {
  @IsNotEmpty()
  fullName: string;

  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  @IsUUID()
  role: string;

  phoneNumber?: string;
  lastLogin?: Date;

}

export class SendCodeDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class VerifyCodeDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  code: string;
}

export class VerifyPhoneDto {
  @IsNotEmpty()
  phone: string;

  @IsNotEmpty()
  countryCode: string;
}