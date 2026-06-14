import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { MiniappService } from './miniapp.service';
import { WechatLoginDto } from './dto/wechat-login.dto';
import { CreateToolUsageDto } from './dto/create-tool-usage.dto';

@Controller('miniapp')
export class MiniappController {
  constructor(private readonly miniappService: MiniappService) {}

  @Post('auth/wechat-login')
  async wechatLogin(@Body() payload: WechatLoginDto) {
    const data = await this.miniappService.wechatLogin(payload.code);

    return {
      code: 200,
      message: 'success',
      data,
    };
  }

  @Get('auth/session')
  async getSession(@Headers('token') token: string) {
    const data = await this.miniappService.verifySession(token);

    return {
      code: 200,
      message: 'success',
      data,
    };
  }

  @Post('tool-usages')
  async createToolUsage(@Headers('token') token: string, @Body() payload: CreateToolUsageDto) {
    const data = await this.miniappService.createToolUsage(token, payload);

    return {
      code: 200,
      message: 'success',
      data,
    };
  }

  @Get('tool-usages')
  async getToolUsages(@Headers('token') token: string) {
    const data = await this.miniappService.getToolUsages(token);

    return {
      code: 200,
      message: 'success',
      data,
    };
  }
}
