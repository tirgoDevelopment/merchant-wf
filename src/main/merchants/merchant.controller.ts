import { Body, Controller, Delete, Get, Patch, Post, Put, Query, UploadedFile, UseInterceptors, UsePipes, ValidationPipe, UploadedFiles } from "@nestjs/common";
import { CreateMerchantDto, MerchantDto } from "./merchant.dto";
import { MerchantService } from "./merchant.service";
import { FilesInterceptor } from "@nestjs/platform-express";

@Controller('api/v2/merchant')
export class MerchantController {
  constructor(
    private merchantsService: MerchantService
  ) { }

  @Get('id')
  async getById(@Query('id') id: number) {
    return this.merchantsService.findMerchantById(id);
  }

  @Get('all')
  async getAll() {
    return this.merchantsService.getMerchants();
  }

  @Get('verified')
  async getAllVerified() {
    return this.merchantsService.getVerifiedMerchants();
  }

  @Get('unverified')
  async getAllUnverified() {
    return this.merchantsService.getUnverifiedMerchants();
  }

  @Post()
  @UsePipes(ValidationPipe)
  async create(@Body() createMerchantDto: CreateMerchantDto) {
    return this.merchantsService.createMerchant(createMerchantDto);
  }

  @Put()
  @UseInterceptors(FilesInterceptor('file'))
  @UsePipes(ValidationPipe)
  async update(
    @UploadedFiles() file: any,
    @Body('merchantId') merchantId: number,
    @Body('phoneNumber') phoneNumber: string,
    @Body('companyName') companyName: string,
    @Body('password') password: string,
    @Body('responsiblePersonLastName') responsiblePersonLastName: string,
    @Body('responsiblePersonFistName') responsiblePersonFistName: string,
    @Body('notes') notes: string,
    @Body('mfo') mfo: string,
    @Body('inn') inn: string,
    @Body('oked') oked: string,
    @Body('dunsNumber') dunsNumber: number,
    @Body('ibanNumber') ibanNumber: number,
    @Body('supervisorFirstName') supervisorFirstName: string,
    @Body('supervisorLastName') supervisorLastName: string,
    @Body('legalAddress') legalAddress: string,
    @Body('factAddress') factAddress: string,
    @Body('bankName') bankName: string,
    @Body('taxPayerCode') taxPayerCode: string,
    @Body('responsbilePersonPhoneNumber') responsbilePersonPhoneNumber: string
  ) {
    return this.merchantsService.updateMerchant(merchantId, file, { phoneNumber, password, companyName, responsiblePersonLastName, responsiblePersonFistName, notes, mfo, inn, oked, dunsNumber, ibanNumber, supervisorFirstName, supervisorLastName, legalAddress, factAddress, bankName, taxPayerCode, responsbilePersonPhoneNumber });
  }

  @Patch('/verify')
  @UsePipes(ValidationPipe)
  async verify(@Query('id') id: number) {
    return this.merchantsService.verifyMerchant(id);
  }

  @Patch('/reject')
  @UsePipes(ValidationPipe)
  async reject(@Query('id') id: number) {
    return this.merchantsService.rejectMerchant(id);
  }

  @Delete()
  async delete(@Query('id') id: number) {
    return this.merchantsService.deleteMerchant(id);
  }
}