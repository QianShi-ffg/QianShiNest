import { Body, Controller, Get, Post, Res, StreamableFile, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { CreateResumeDto } from './dto/create-resume.dto';
import { ResumeService } from './resume.service';

@Controller('resume')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  /**
   * 查询前台公开简历信息，受保护字段会被隐藏并禁止浏览器缓存。
   */
  @Get()
  async findCurrent(@Res({ passthrough: true }) response: Response) {
    const res = await this.resumeService.findCurrent();
    response.setHeader('Cache-Control', 'no-store');
    return {
      code: 200,
      message: 'success',
      data: res,
    };
  }

  /**
   * 查询后台完整简历配置，只有登录后台并携带有效 JWT 时可以访问。
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('admin')
  async findCurrentAdmin() {
    const res = await this.resumeService.findCurrent(true);
    return {
      code: 200,
      message: 'success',
      data: res,
    };
  }

  /**
   * 校验前台输入的简历访问密码，用于“查看更多”解锁流程。
   */
  @Post('verify-password')
  async verifyPassword(@Body() body: { password?: string }) {
    return this.resumeService.verifyPassword(body.password || '');
  }

  /**
   * 密码校验通过后返回完整简历内容，避免未解锁前把私密内容下发到前端。
   */
  @Post('full')
  async findFull(
    @Body() body: { password?: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    const res = await this.resumeService.findFull(body.password || '');
    response.setHeader('Cache-Control', 'no-store');
    return {
      code: 200,
      message: 'success',
      data: res,
    };
  }

  /**
   * 修改简历访问密码，后台个人信息页设置或更新简历密码时使用。
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('password')
  async changePassword(@Body() body: { oldPassword?: string; newPassword?: string }) {
    try {
      const res = await this.resumeService.changePassword(
        body.oldPassword || '',
        body.newPassword || '',
      );
      return {
        code: 200,
        message: 'success',
        data: res,
      };
    } catch (error) {
      return {
        code: 500,
        message: error instanceof Error ? error.message : 'Resume password update failed',
        data: null,
      };
    }
  }

  /**
   * 下载简历文件，下载前同样校验访问密码，避免绕过前台解锁按钮。
   */
  @Post('download')
  async download(
    @Body() body: { password?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const file = await this.resumeService.getDownloadFile(body.password || '');
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(file.filename)}"`,
    });
    return new StreamableFile(file.stream);
  }

  /**
   * 保存后台个人信息和简历配置，包含公开信息、私密信息、下载文件和访问保护。
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('saveResume')
  async save(@Body() createResumeDto: CreateResumeDto) {
    const res = await this.resumeService.save(createResumeDto);
    return {
      code: 200,
      message: 'success',
      data: res,
    };
  }
}
