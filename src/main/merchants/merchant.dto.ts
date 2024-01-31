
import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { PrimaryGeneratedColumn } from "typeorm";

export class CreateMerchantDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  @IsNotEmpty()
  password: string;

}

export class MerchantDto {

  id?: number;
  responsiblePersonLastName: string;
  responsiblePersonFistName: string;
  responsbilePersonPhoneNumber?: string;
  password: string;
  phoneNumber: string;
  companyName: string;
  registrationCertificateFilePath?: string;
  transportationCertificateFilePath?: string; 
  passportFilePath?: string;
  logoFilePath?: string;
  notes?: string;
  mfo?: string;
  inn?: string;
  oked?: string;
  dunsNumber?: number;
  supervisorFirstName?: string;
  supervisorLastName?: string;
  legalAddress?: string;
  factAddress?: string;
  bankName?: string;
  bankAccounts?: iBankAccount[];
  verifiedBy?: string;
  ibanNumber?: number;
  taxPayerCode?: string;
}

export interface iBankAccount {
  account: string;
  currency: number;
}