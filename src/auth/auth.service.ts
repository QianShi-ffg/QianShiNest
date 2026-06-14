import { Injectable } from '@nestjs/common';
import { UserService } from '../modules/user/user.service';
import { AuthTokenService } from './auth-token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly authTokenService: AuthTokenService,
  ) {}
  async validateUser(name: string, password: string): Promise<any> {
    const user = await this.userService.findOne(name);
    if (user[0] && (await this.userService.verifyUserPassword(user[0], password))) {
      return user[0];
    }
    return null;
  }

  async login(user: any) {
    const permissions = await this.userService.getPermissionsByRole(user.role);
    const payload = {
      userId: user.id,
      username: user.name,
      role: user.role,
      permissions,
    };
    return {
      code: 200,
      access_token: this.authTokenService.signAdmin(payload),
      data: payload,
      message: '登录成功',
    };
  }

  async getUserInfo(userId: number) {
    return this.userService.findById(userId);
  }

  async getSession(userId: number) {
    const user = await this.userService.findById(userId);
    return {
      valid: Boolean(user),
      user,
    };
  }
}
