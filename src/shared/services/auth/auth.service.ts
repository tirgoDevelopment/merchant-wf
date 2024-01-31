import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { BpmResponse } from 'src/main/index';
import { HttpService } from "@nestjs/axios";
import { MerchantService } from 'src/main/merchants/merchant.service';
import { MerchantUserService } from 'src/main/merchant-user/merchant-user.service';


@Injectable()
export class AuthService {
  constructor(
    private merchantUsersService: MerchantUserService,
    private jwtService: JwtService,
    private merchantService: MerchantService,
    private readonly httpService: HttpService
  ) { }

  async signIn(username, pass) {
    if (!username) {
      return new BpmResponse(false, null, ['username is required'])
    }
    if (!pass) {
      return new BpmResponse(false, null, ['password is required'])
    }
    const user = await this.merchantUsersService.findUserByUsername(username);
    if (!user) {
      const merchant = await this.merchantService.findMerchantByEmail(username);
      if (!merchant) {
        return new BpmResponse(false, null, ['User not found'])
      }
      if (!(await bcrypt.compare(pass, merchant.password))) {
        throw new UnauthorizedException();
      }
      const payload = { sub: merchant?.id, username: merchant.email, merchantId: merchant?.id };
      const access_token = await this.jwtService.signAsync(payload, { secret: 'jwt-merchant-secret-key' })
      return new BpmResponse(true, { access_token: access_token }, null)
    }
    if (!(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user?.id, username: user.username, merchantId: user.merchant['id'] };
    const access_token = await this.jwtService.signAsync(payload, { secret: 'jwt-merchant-secret-key' })
    user.lastLogin = new Date();
    this.merchantUsersService.updateUser(user.id, user)
    return new BpmResponse(true, { access_token: access_token }, null)

  }
}