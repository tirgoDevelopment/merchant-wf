import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateMerchantDto, MerchantDto } from './merchant.dto';
import { BpmResponse, User, Role, Order, Merchant, Transaction, BankAccount, NoContentException, InternalErrorException, ResponseStauses } from '..';
import { SseGateway } from 'src/shared/gateway/sse.gateway';

@Injectable()
export class MerchantService {
  constructor(
    @InjectRepository(Merchant) private readonly merchantsRepository: Repository<Merchant>,
    @InjectRepository(BankAccount) private readonly bankAccountRepository: Repository<BankAccount>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Role) private readonly rolesRepository: Repository<Role>,
    @InjectRepository(Order) private readonly ordersRepository: Repository<Order>,
    @InjectRepository(Transaction) private readonly transactionsRepository: Repository<Transaction>,
    private eventsService: SseGateway
  ) { }

  async getMerchants() {
    try {
      const data: any = await this.merchantsRepository.find({
        where: { active: true },
        relations: ['users', 'orders']
      });
      // for (let i = 0; i < data.length; i++) {
      //   const bankAccount: any = await this.bankAccountRepository.find({ where: { active: true, merchantId: data[i].id }, relations: ['currency'] })
      //   const accountData = bankAccount.map((el: any) => {
      //     return { account: el.account, currencyName: el.currency?.name }
      //   })
      //   data[i].bankAccounts = accountData;
      // }
      if (data.legnth) {
        return new BpmResponse(true, data, null);
      } else {
        throw new NoContentException();
      }
    }
    catch (err: any) {
      if (err instanceof HttpException) {
        throw err
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
      }
    }
  }

  async getVerifiedMerchants() {
    try {
      const data: any = await this.merchantsRepository.find({
        where: { active: true, verified: true, completed: true },
        relations: ['users', 'orders']
      });

      let transactions = await this.transactionsRepository.find({ where: { active: true, verified: true }, relations: ['merchant'] });

      const cargos = await this.ordersRepository.find({ where: { active: true }, relations: ['merchant'] });

      // for (let i = 0; i < data.length; i++) {
      //   const bankAccount: any = await this.bankAccountRepository.find({ where: { active: true, merchantId: data[i]?.id }, relations: ['currency'] })
      //   const accountData = bankAccount.map((el: any) => {
      //     return { account: el.account, currencyName: el.currency?.name }
      //   })
      //   data[i].bankAccounts = accountData;
      //   data[i].cargosCount = cargos.filter((el: any) => el.merchant['id'] == data[i].id).length;

      //   const rawTransactions = transactions.filter((el: any) => el.merchant['id'] == data[i]?.id);
      //   const topup = rawTransactions.filter((el: any) => el.transactionType == 'topup').reduce((a: any, b: any) => a + b.amount, 0);
      //   const withdraw = rawTransactions.filter((el: any) => el.transactionType == 'withdrow').reduce((a: any, b: any) => a + b.amount, 0);
      // }
      return new BpmResponse(true, data, null);
    }
    catch (error: any) {
      console.log(error)
    }
  }

  async getUnverifiedMerchants() {
    try {
      const data: any = await this.merchantsRepository.find({
        where: { active: true, verified: false, rejected: false, completed: true },
        relations: ['users']
      });
      // for (let i = 0; i < data.length; i++) {
      //   const bankAccount: any = await this.bankAccountRepository.find({ where: { active: true, merchantId: data[i].id }, relations: ['currency'] })
      //   const accountData = bankAccount.map((el: any) => {
      //     return { account: el.account, currencyName: el.currency?.name }
      //   })
      //   data[i].bankAccounts = accountData;
      // }
      return new BpmResponse(true, data, null);
    }
    catch (error: any) {
      console.log(error)
    }
  }

  async findMerchantById(id: number) {
    try {
      const data = await this.merchantsRepository.findOne({ where: { id, active: true } });
      // if (data) {
      //   const bankAccount: any = await this.bankAccountRepository.find({ where: { active: true, merchantId: data.id }, relations: ['currency'] })
      //   const accountData = bankAccount.map((el: any) => {
      //     return { account: el.account, currencyName: el.currency?.name }
      //   })
      //   data.bankAccounts = accountData;
      //   return new BpmResponse(true, data, null);
      // } else {
      //   return new BpmResponse(false, null, ['Not found']);
      // }
    }
    catch (error: any) {
      console.log(error)
    }
  }

  async findMerchantByEmail(email: string) {
    return await this.merchantsRepository.findOneOrFail({ where: { email } });
  }

  async createMerchant(createMerchantDto: CreateMerchantDto) {
    try {
      const saltOrRounds = 10;
      const passwordHash = await bcrypt.hash(createMerchantDto.password, saltOrRounds);
      const merchant: Merchant = await this.merchantsRepository.create();
      merchant.email = createMerchantDto.email;
      merchant.password = passwordHash;
      merchant.phoneNumber = createMerchantDto.phoneNumber;
      merchant.companyName = createMerchantDto.companyName;


      const newMerchant = await this.merchantsRepository.save(merchant);
      if (newMerchant) {
        return new BpmResponse(true, newMerchant, null)
      }
    } catch (error: any) {
      console.log(error)
      throw new HttpException('internal error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  async updateMerchant(id: number, files: any, updateMerchantDto: MerchantDto): Promise<BpmResponse> {
    try {

      const merchant: Merchant = await this.merchantsRepository.findOneOrFail({ where: { id } });

      if (updateMerchantDto.password) {
        const saltOrRounds = 10;
        const passwordHash = await bcrypt.hash(updateMerchantDto.password, saltOrRounds);
        merchant.password = passwordHash;
      }

      merchant.registrationCertificateFilePath = updateMerchantDto.registrationCertificateFilePath || merchant.registrationCertificateFilePath;
      merchant.transportationCertificateFilePath = updateMerchantDto.transportationCertificateFilePath || merchant.transportationCertificateFilePath;
      merchant.passportFilePath = updateMerchantDto.passportFilePath || merchant.passportFilePath;
      merchant.logoFilePath = updateMerchantDto.logoFilePath || merchant.logoFilePath;

      merchant.phoneNumber = updateMerchantDto.phoneNumber || merchant.phoneNumber;
      merchant.companyName = updateMerchantDto.companyName || merchant.companyName;
      merchant.responsiblePersonLastName = updateMerchantDto.responsiblePersonLastName || merchant.responsiblePersonLastName;
      merchant.responsiblePersonFistName = updateMerchantDto.responsiblePersonFistName || merchant.responsiblePersonFistName;
      merchant.notes = updateMerchantDto.notes || merchant.notes;
      merchant.mfo = updateMerchantDto.mfo || merchant.mfo;
      merchant.inn = updateMerchantDto.inn || merchant.inn;
      merchant.oked = updateMerchantDto.oked || merchant.oked;
      merchant.dunsNumber = updateMerchantDto.dunsNumber || merchant.dunsNumber;
      merchant.ibanNumber = updateMerchantDto.ibanNumber || merchant.ibanNumber;
      merchant.supervisorFirstName = updateMerchantDto.supervisorFirstName || merchant.supervisorFirstName;
      merchant.supervisorLastName = updateMerchantDto.supervisorLastName || merchant.supervisorLastName;
      merchant.legalAddress = updateMerchantDto.legalAddress || merchant.legalAddress;
      merchant.factAddress = updateMerchantDto.factAddress || merchant.factAddress;
      merchant.bankName = updateMerchantDto.bankName || merchant.bankName;
      merchant.taxPayerCode = updateMerchantDto.taxPayerCode || merchant.taxPayerCode;
      merchant.responsbilePersonPhoneNumber = updateMerchantDto.responsbilePersonPhoneNumber || merchant.responsbilePersonPhoneNumber;

      if (updateMerchantDto.bankAccounts) {
        await this.bankAccountRepository.delete({ merchant: { id: merchant.id} });
        const query = `
        INSERT INTO bank_account (account, currency, ...) 
        VALUES
          ${updateMerchantDto.bankAccounts.map((account: any) => `('${account.account}', '${account.currency}', ...)`).join(', ')}
        RETURNING *;`;
        merchant.bankAccounts = await this.bankAccountRepository.query(query);
      }

      const updatedMerchant = await this.merchantsRepository.update({ id: merchant.id }, merchant);
      if (updatedMerchant) {
        return new BpmResponse(true, updatedMerchant, null);
      }

    } catch (error: any) {
      console.log(error)
      throw new HttpException('internal error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async verifyMerchant(id: number): Promise<BpmResponse> {
    try {

      const merchant: Merchant = await this.merchantsRepository.findOneBy({ id });
      if (merchant) {
        merchant.verified = true;
        const verifed = await this.merchantsRepository.save(merchant);
        if (verifed) {
          const role = (await this.rolesRepository.findOne({ where: { name: 'Super admin' } }))?.id;
          const userObj: any = {
            fullName: merchant.supervisorFirstName + ' ' + merchant.supervisorLastName,
            password: merchant.password,
            username: merchant.email,
            phoneNumber: merchant.phoneNumber,
            merchant: id,
            role: role
          }
          this.usersRepository.save(userObj);
          this.eventsService.sendVerifiedTransction('1')
          return new BpmResponse(true, null, ['Merchant verified']);
        }
      } else {
        return new BpmResponse(false, null, ['Merchant not found']);
      }
    } catch (error: any) {
      console.log(error)
      throw new HttpException('internal error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async rejectMerchant(id: number): Promise<BpmResponse> {
    try {

      const merchant: Merchant = await this.merchantsRepository.findOneBy({ id });
      if (merchant) {
        merchant.rejected = true;
        const verifed = await this.merchantsRepository.save(merchant);
        if (verifed) {
          return new BpmResponse(true, null, ['Merchant rejected']);
        }
      } else {
        return new BpmResponse(false, null, ['Merchant not found']);
      }
    } catch (error: any) {
      console.log(error)
      throw new HttpException('internal error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async deleteMerchant(id: number): Promise<BpmResponse> {
    const isDeleted = await this.merchantsRepository.createQueryBuilder()
      .update(Merchant)
      .set({ active: false })
      .where("id = :id", { id })
      .execute();
    if (isDeleted.affected) {
      return new BpmResponse(true, 'Successfully updated', null);
    } else {
      return new BpmResponse(true, 'Update failed', null);
    }
  }
}