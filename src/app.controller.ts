import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  Headers,
  Ip,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express, Request } from 'express';
import { getPasswordPublicKey } from './utils/password-crypto';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * 后台首页概览接口，汇总文章、分类等后台首页需要展示的统计数据。
   */
  @Get('overview')
  overview() {
    return this.appService.overview();
  }

  /**
   * 手动刷新友链截图所需的访问令牌，供截图任务或调试时重新获取鉴权信息。
   */
  @Get('refreshToken')
  refreshToken(): any {
    return this.appService.refreshToken();
  }

  /**
   * 根据请求头中的客户端信息解析城市，并返回当前城市天气数据。
   */
  @Get('cityWeather')
  cityWeather(@Headers() header) {
    return this.appService.city(header);
  }

  /**
   * 返回前端密码加密用的 RSA 公钥，避免登录或简历密码明文传输。
   */
  @Get('crypto/public-key')
  getPublicKey() {
    return {
      code: 200,
      message: 'success',
      data: {
        publicKey: getPasswordPublicKey(),
      },
    };
  }

  /**
   * 公共文件上传接口，保留给文章封面等通用资源使用。
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file, 22);
    const res = await this.appService.uploadFile(file);
    console.log(res, 'resres');
    return { code: 200, data: [res] };
  }

  /**
   * 日记专用上传接口，按日记媒体类型落到 diary 目录，避免和公共上传资源混在一起。
   */
  @Post('upload/diary')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDiaryFile(@UploadedFile() file: Express.Multer.File) {
    const res = await this.appService.uploadDiaryFile(file);
    return { code: 200, data: [res] };
  }

  /**
   * 作品专用上传接口，供后台作品管理上传封面、图片和视频资源。
   */
  @Post('upload/project')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProjectFile(@UploadedFile() file: Express.Multer.File) {
    const res = await this.appService.uploadProjectFile(file);
    return { code: 200, data: [res] };
  }

  /**
   * 简历专用上传接口，主要用于头像、简历文件等个人资料资源。
   */
  @Post('upload/resume')
  @UseInterceptors(FileInterceptor('file'))
  async uploadResumeFile(@UploadedFile() file: Express.Multer.File) {
    const res = await this.appService.uploadResumeFile(file);
    return { code: 200, data: [res] };
  }

  /**
   * 刷新单个友链站点截图，后台维护友链时用于重新生成预览图。
   */
  @Post('refreshScreenShot')
  async refreshScreenShot(@Body() data: any) {
    const res = await this.appService.refreshScreenShot(data);
    console.log(res);
    return res;
  }
}
