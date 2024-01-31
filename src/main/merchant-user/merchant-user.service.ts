import { HttpException, Injectable } from '@nestjs/common';
import { BadRequestException, BpmResponse, InternalErrorException, Merchant, MerchantUser, NoContentException, NotFoundException, ResponseStauses, User } from '..';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailService } from 'src/shared/services/mail.service';
import { SmsService } from 'src/shared/services/sms.service';
import { CreateMerchantUserDto, SendCodeDto, UpdateMerchantUserDto, VerifyCodeDto, VerifyPhoneDto } from './merchant-user.dto';
import * as bcrypt from 'bcrypt';
import { UserTypes } from '@shared-entities/index';

@Injectable()
export class MerchantUserService {

    constructor(
        @InjectRepository(MerchantUser) private readonly merchantUsersRepository: Repository<MerchantUser>,
        @InjectRepository(Merchant) private readonly merchantsRepository: Repository<Merchant>,
        @InjectRepository(User) private readonly usersRepository: Repository<User>,
        private mailService: MailService,
        private smsService: SmsService
    ) { }

    async createUser(createUserDto: CreateMerchantUserDto): Promise<BpmResponse> {
        const queryRunner = this.merchantUsersRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        try {
            const merchant = await this.merchantsRepository.findOneOrFail({ where: { id: createUserDto.merchantId } })
            const saltOrRounds = 10;
            const passwordHash = await bcrypt.hash(createUserDto.password, saltOrRounds);
            let createuserObj: MerchantUser = {
                fullName: createUserDto.fullName,
                username: createUserDto.username,
                phoneNumber: createUserDto.phoneNumber,
                role: createUserDto.role,
                password: passwordHash,
                merchant: merchant
            }
            const newMerchantUser = await this.merchantUsersRepository.save(createuserObj);

            const user: User = await this.usersRepository.save({ userType: UserTypes.MerchantUser, merchantUser: newMerchantUser });
            if(!user) {
              await queryRunner.rollbackTransaction(); 
              throw new InternalErrorException(ResponseStauses.CreateDataFailed);
            }
      
            newMerchantUser.user = user;
            const resClient = await this.merchantUsersRepository.update({ id: createuserObj.id }, newMerchantUser);
            if(!resClient.affected) {
              await queryRunner.rollbackTransaction();
              throw new InternalErrorException(ResponseStauses.InternalServerError, 'Attach user to merhcantUser failed');
            }

            return new BpmResponse(true, newMerchantUser, [ResponseStauses.SuccessfullyCreated]);
        } catch (err: any) {
            await queryRunner.rollbackTransaction();
            if(err.name == 'EntityNotFoundError') {
                throw new NotFoundException(ResponseStauses.MercahntNotFound)
            } else if (err instanceof HttpException) {
                throw err
            } else {
                throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
            }
        } finally {
            await queryRunner.release();
        }
    }

    async updateUser(id: number, updates: UpdateMerchantUserDto): Promise<BpmResponse> {
        try {
            const user: MerchantUser = await this.merchantUsersRepository.findOneOrFail({ where: { id, active: true } });
            user.fullName = updates.fullName || user.fullName;
            user.username = updates.username || user.username;
            user.phoneNumber = updates.phoneNumber || user.phoneNumber;
            user.role = updates.role || user.role;
            user.lastLogin = updates.lastLogin || user.lastLogin;
            user.password = user.password;
            const updated = await this.merchantUsersRepository.save(user);
            return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
        } catch (err: any) {
            if (err.name == 'EntityNotFoundError') {
                throw new NoContentException();
            } else if (err instanceof HttpException) {
                throw err
            } else {
                throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
            }
        }
    }

    async deleteUser(id: string): Promise<BpmResponse> {
        try {
            const isDeleted = await this.merchantUsersRepository.createQueryBuilder()
                .update(MerchantUser)
                .set({ active: false })
                .where("id = :id", { id })
                .execute();
            if (isDeleted.affected) {
                return new BpmResponse(true, null, [ResponseStauses.SuccessfullyDeleted]);
            } else {
                return new BpmResponse(true, null, [ResponseStauses.DeleteDataFailed]);
            }
        } catch (err: any) {
            if (err instanceof HttpException) {
                throw err
            } else {
                throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
            }
        }
    }

    async changeUserState(id: number): Promise<BpmResponse> {
        try {
            const user: MerchantUser = await this.merchantUsersRepository.findOneOrFail({ where: { id } })
            if (!user) {
                throw new NotFoundException(ResponseStauses.NotFound);
            }
            user.disabled = !user.disabled;
            const save = await this.merchantUsersRepository.save(user);
            if (save) {
                return new BpmResponse(true, null, [ResponseStauses.SuccessfullyDeleted]);
            } else {
                return new BpmResponse(true, null, [ResponseStauses.DeleteDataFailed]);
            }
        } catch (err: any) {
            if (err.name == 'EntityNotFoundError') {
                throw new NoContentException();
            } else if (err instanceof HttpException) {
                throw err
            } else {
                throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
            }
        }
    }

    async changeUserPassword(password: string, newPassword: string, id: number): Promise<BpmResponse> {
        try {
            if (!password || !newPassword || !id) {
                throw new BadRequestException(ResponseStauses.AllFieldsRequired);
            }
            const user: MerchantUser = await this.merchantUsersRepository.findOneOrFail({ where: { active: true, id } });
            if (!user) {
                throw new NotFoundException(ResponseStauses.UserNotFound);
            }
            if (!(await bcrypt.compare(password, user.password))) {
                throw new BadRequestException(ResponseStauses.InvalidPassword)
            } else {
                const saltOrRounds = 10;
                const passwordHash = await bcrypt.hash(newPassword, saltOrRounds);
                user.password = passwordHash;
                const res = await this.merchantUsersRepository.update({ id: user.id }, user);
                if (res.affected) {
                    return new BpmResponse(true, null, [ResponseStauses.SuccessfullyDeleted]);
                } else {
                    return new BpmResponse(true, null, [ResponseStauses.DeleteDataFailed]);
                }
            }
        } catch (err: any) {
            if (err.name == 'EntityNotFoundError') {
                throw new NoContentException();
            } else if (err instanceof HttpException) {
                throw err
            } else {
                throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
            }
        }
    }

    async resetUserPassword(password: string, email: string): Promise<BpmResponse> {
        try {
            if (!password || !email) {
                throw new BadRequestException(ResponseStauses.AllFieldsRequired);
            }
            const user: MerchantUser = await this.merchantUsersRepository.findOneOrFail({ where: { active: true, username: email } });
            if (!user) {
                throw new NotFoundException(ResponseStauses.UserNotFound);
            }
            const saltOrRounds = 10;
            const passwordHash = await bcrypt.hash(password, saltOrRounds);
            user.password = passwordHash;
            const res = await this.merchantUsersRepository.update({ id: user.id }, user);
            if (res.affected) {
                return new BpmResponse(true, null, [ResponseStauses.SuccessfullyDeleted]);
            } else {
                return new BpmResponse(true, null, [ResponseStauses.DeleteDataFailed]);
            }
        } catch (err: any) {
            if (err.name == 'EntityNotFoundError') {
                throw new NoContentException();
            } else if (err instanceof HttpException) {
                throw err
            } else {
                throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
            }
        }
    }

    async sendMailToResetPassword(sendCodeDto: SendCodeDto) {
        try {
            const code = await this.generateRoomCode();
            try {
                const user = await this.merchantUsersRepository.findOneOrFail({ where: { username: sendCodeDto.email, active: true } });
                const info = await this.mailService.sendMail(sendCodeDto.email, 'Verification code', code)
                const timestamp = new Date().getTime(); // Capture the timestamp when the code is generated
                const expirationTime = 3 * 60 * 1000; // 3 minutes in milliseconds
                console.log('Message sent: %s', info.messageId);
                user.resetPasswordCode = code;
                user.resetPasswordCodeSentDate = (timestamp + expirationTime).toString();
                const res = await this.merchantUsersRepository.update({ id: user.id }, user);
                if (res.affected) {
                    return new BpmResponse(true, null, ['ok']);
                } else {
                    throw new InternalErrorException(ResponseStauses.InternalServerError);
                }

            } catch (error) {
                console.error('Error sending email:', error);
                return new BpmResponse(false, null, [ResponseStauses.CreateDataFailed]);
            }
        } catch (err: any) {
            if (err.name == 'EntityNotFoundError') {
                throw new NotFoundException(ResponseStauses.UserNotFound);
            } else if (err instanceof HttpException) {
                throw err
            } else {
                throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
            }
        }
    }

    async generateRoomCode() {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        return code;
    }

    async isCodeValid(date) {
        const currentTimestamp = Date.now();
        return currentTimestamp <= date;
    }

    async verifyResetPasswordCode(verifyCodeDto: VerifyCodeDto) {
        let bpmResponse;
        try {
            const user = await this.merchantUsersRepository.findOneOrFail({ where: { username: verifyCodeDto.email, active: true } });
            if (user.resetPasswordCode == verifyCodeDto.code && await this.isCodeValid(+user.resetPasswordCodeSentDate)) {
                bpmResponse = new BpmResponse(true, null);
                user.resetPasswordCode = null;
                user.resetPasswordCodeSentDate = null;
                this.merchantUsersRepository.update({ id: user.id }, user);
            } else {
                bpmResponse = new BpmResponse(false, null, ['Code is Invalid']);
            }
            return bpmResponse;
        } catch (error) {
            console.error('Error sending email:', error);
            return new BpmResponse(false, null, [ResponseStauses.CreateDataFailed]);
        }
    }

    async phoneVerify(verifyPhoneDto: VerifyPhoneDto) {
        let bpmResponse;
        try {
            const code = await this.generateRoomCode()
            const phone = verifyPhoneDto.phone;
            const countryCode = verifyPhoneDto.countryCode;
            if (phone.startsWith('+998') || phone.startsWith('998')) {
                this.smsService.sendSmsLocal(phone, code)
            } else if (phone.startsWith('+77') || phone.startsWith('77')) {
                this.smsService.sendSmsRu(phone, code)
            } else {
                this.smsService.sendSmsGlobal(phone, code, countryCode)
            }
            bpmResponse = new BpmResponse(true, { code });
            return bpmResponse;
        } catch (error) {
            console.error('Error sending email:', error);
            return new BpmResponse(false, null, [ResponseStauses.CreateDataFailed]);
        }
    }

    findUserById(id: number) {
        return this.merchantUsersRepository.findOne({ where: { id, active: true }, relations: ['role'] });
    }

    findUserByIot(id: number) {
        return this.merchantUsersRepository.findOne({ where: { id, active: true }, relations: ['role'] });
    }

    findUserByUsername(username: string) {
        return this.merchantUsersRepository.findOne({ where: { username, active: true }, relations: ['role', 'merchant'] });
    }

    async getUsers() {
        try {
            const data = (await this.merchantUsersRepository.find({ where: { active: true }, relations: ['role'] })).map((el: any) => {
                return {
                    id: el.id,
                    fullName: el.fullName,
                    username: el.username,
                    createdAt: el.createdAt,
                    active: el.active,
                    disabled: el.disabled,
                    lastLogin: el.lastLogin,
                    role: { id: el.role.id, name: el.role.name, description: el.role.description }
                }
            });
            if (data.length) {
                return new BpmResponse(true, data)
            } else {
                throw new NoContentException()
            }
        } catch (err: any) {
            if (err instanceof HttpException) {
                throw err
            } else {
                throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
            }
        }
    }

    async getMerchantUsers(id: number) {
        try {
            const data = (await this.merchantUsersRepository.find({ where: { active: true, merchant: { id } }, relations: ['role'] })).map((el: any) => {
                return {
                    id: el.id,
                    fullName: el.fullName,
                    username: el.username,
                    createdAt: el.createdAt,
                    active: el.active,
                    disabled: el.disabled,
                    lastLogin: el.lastLogin,
                    role: { id: el.role.id, name: el.role.name, description: el.role.description }
                }
            });
            if (data.length) {
                return new BpmResponse(true, data)
            } else {
                throw new NoContentException()
            }
        } catch (err: any) {
            if (err instanceof HttpException) {
                throw err
            } else {
                throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
            }
        }
    }

}
