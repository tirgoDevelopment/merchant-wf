import { Body, Controller, Delete, Get, Patch, Post, Put, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { MerchantUserService } from './merchant-user.service';
import { CreateMerchantUserDto, SendCodeDto, UpdateMerchantUserDto, VerifyCodeDto, VerifyPhoneDto } from './merchant-user.dto';

@Controller('api/v2/merchant-user')
export class MerchantUserController {

    constructor(
        private merchantUsersService: MerchantUserService
    ) {}

    @Get('id')
    async getUserById(@Query('id') id: number) {
        return this.merchantUsersService.findUserById(id);
    }

    @Get()
    async getUsers() {
        return this.merchantUsersService.getUsers();
    }

    @Get('merchant')
    async getMerchantUsers(@Query() id: number) {
        return this.merchantUsersService.getMerchantUsers(id);
    }

    @Post()
    @UsePipes(ValidationPipe)
    async createUser(@Body() createUserDto: CreateMerchantUserDto) {
        return this.merchantUsersService.createUser(createUserDto);
    }

    @Post('send-code')
    @UsePipes(ValidationPipe)
    async sendCode(@Body() sendCodeDto: SendCodeDto) {
        return this.merchantUsersService.sendMailToResetPassword(sendCodeDto);
    }

    @Post('verify-code')
    @UsePipes(ValidationPipe)
    async verifyCode(@Body() sendCodeDto: VerifyCodeDto) {
        return this.merchantUsersService.verifyResetPasswordCode(sendCodeDto);
    }

    @Post('phone-verify')
    @UsePipes(ValidationPipe)
    async phoneVerify(@Body() sendPhoneVerifyDto: VerifyPhoneDto) {
        return this.merchantUsersService.phoneVerify(sendPhoneVerifyDto);
    }

    @Patch('password')
    @UsePipes(ValidationPipe)
    async changePass(@Query('id') id: number, @Body() body: { password: string, newPassword: string }) {
        return this.merchantUsersService.changeUserPassword(body.password, body.newPassword, id);
    }

    @Patch('reset-password')
    @UsePipes(ValidationPipe)
    async resetPass(@Body() body: { password: string, email: string }) {
        return this.merchantUsersService.resetUserPassword(body.password, body.email);
    }

    @Put()
    @UsePipes(ValidationPipe)
    async updateUser(@Query('id') id: number, @Body() updateUserDto: UpdateMerchantUserDto) {
        return this.merchantUsersService.updateUser(id, updateUserDto);
    }

    @Patch('state')
    @UsePipes(ValidationPipe)
    async disableUser(@Query('id') id: number) {
        return this.merchantUsersService.changeUserState(id);
    }

    @Delete()
    async deleteUser(@Query('id') id: string) {
        return this.merchantUsersService.deleteUser(id);
    }
}
