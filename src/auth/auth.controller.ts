import { Controller, Request, Post, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 后台登录接口，先经过 local 策略校验账号密码，再签发后台访问令牌。
   */
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    // const res = this.authService.login(req.user);
    return this.authService.login(req.user);
  }

  /**
   * 根据 JWT 中的用户 id 返回当前登录人的账号信息和权限。
   */
  @UseGuards(AuthGuard('jwt')) // jwt策略，身份鉴权
  @Get('userInfo')
  getUserInfo(@Request() req) {
    // 通过req获取到被验证后的user，也可以使用装饰器
    return this.authService.getUserInfo(req.user.userId);
  }

  /**
   * 后台登录态校验接口，前端可在刷新或进入系统时确认 token 是否仍有效。
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('session')
  async getSession(@Request() req) {
    const data = await this.authService.getSession(req.user.userId);

    return {
      code: 200,
      message: 'success',
      data,
    };
  }
}
