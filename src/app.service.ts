import { Injectable, Headers, Ip, HostParam } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as dayjs from 'dayjs';
import { createWriteStream, mkdirSync, existsSync, writeFileSync } from 'fs';
import { join, extname } from 'path';
import { FriendShipService } from './modules/friend-ship/friend-ship.service';
import { CountToken } from './entities/token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(CountToken)
    private CountTokenRepository: Repository<CountToken>,
    private httpService: HttpService,
    private readonly friendShipService: FriendShipService,
  ) {}

  /**
   * 获取百度统计概览数据，后台首页用它展示访问趋势。
   */
  async overview(): Promise<any> {
    const res = await this.countToken();
    return this.httpService
      .get('https://openapi.baidu.com/rest/2.0/tongji/report/getData', {
        params: {
          access_token: res.access_token,
          site_id: '18341059',
          method: 'overview/getTimeTrendRpt',
          start_date: dayjs('2022-09-01').format('YYYYMMDD'),
          end_date: dayjs().format('YYYYMMDD'),
          metrics: 'pv_count,visitor_count',
        },
      })
      .toPromise()
      .then((res) => {
        if (res.data && res.data.error_code === 111) {
          return {
            code: 111,
            data: res.data.result,
            message: 'token过期,正在重新刷新token',
          };
        }
        return {
          code: 200,
          data: res.data.result,
          message: '获取数据成功',
        };
      })
      .catch((err) => {
        if (err.data && err.data.error_code === 110) {
          return {
            code: 110,
            data: [],
            message: 'token过期,正在重新刷新token',
          };
        }
      });
  }

  /**
   * 使用数据库中的 refresh_token 换取新的百度统计 access_token。
   */
  async refreshToken(): Promise<any> {
    const res = await this.countToken();
    return this.httpService
      .get('http://openapi.baidu.com/oauth/2.0/token', {
        params: {
          grant_type: 'refresh_token',
          refresh_token: res.refresh_token,
          client_id: res.apiKey,
          client_secret: res.secretKey,
        },
      })
      .toPromise()
      .then(async (result) => {
        await this.CountTokenRepository.update(1, {
          refresh_token: result.data.refresh_token,
          access_token: result.data.access_token,
          expires_in: result.data.expires_in,
        });
        return { code: 200, data: result.data, message: '获取数据成功' };
      })
      .catch((err) => {
        console.log(err, 'err');
        return { code: 2001, message: err.data };
      });
  }

  /**
   * 查询百度统计 token 配置。
   */
  countToken() {
    return this.CountTokenRepository.findOne({
      where: { id: 1 },
    });
  }

  /**
   * 从代理请求头中提取真实客户端 IP。
   */
  private getForwardedIp(header) {
    const forwarded = header['x-forwarded-for'];
    const realIp = header['x-real-ip'];
    const value = Array.isArray(forwarded) ? forwarded[0] : forwarded || realIp;
    return value ? String(value).split(',')[0].trim() : '';
  }

  /**
   * 判断当前 IP 是否为本地或内网地址，本地地址需要额外换取公网 IP。
   */
  private isLocalIp(ip: string) {
    return (
      !ip ||
      ip === '::1' ||
      ip === '127.0.0.1' ||
      ip === 'localhost' ||
      ip.startsWith('192.168.') ||
      ip.startsWith('10.') ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(ip)
    );
  }

  /**
   * 通过公开服务获取当前服务器出口公网 IP，供本地调试天气定位使用。
   */
  private async getPublicIp() {
    try {
      const res = await this.httpService
        .get('https://api.ipify.org', {
          params: { format: 'json' },
          timeout: 5000,
        })
        .toPromise();
      return res?.data?.ip || '';
    } catch (error) {
      console.log(error, 'publicIpErr');
      return '';
    }
  }

  /**
   * 根据客户端 IP 获取城市定位，再用经纬度查询实时天气。
   */
  async city(header) {
    let ip = this.getForwardedIp(header);
    if (this.isLocalIp(ip)) {
      ip = await this.getPublicIp();
    }

    return this.httpService
      .get('https://api.map.baidu.com/location/ip', {
        params: {
          ak: 'Fn2X2OdjdA66GdbaVG4K30OH6owjjH5D',
          ip: ip || undefined,
          coor: 'bd09ll',
        },
        timeout: 8000,
      })
      .toPromise()
      .then(async (result) => {
        console.log(result.data, 6666666666666666);
        if (result.data.status === 210) {
          return {
            code: 200,
            data: {},
            message: 'IP校验失败',
          };
        } else {
          const address = result.data.address;
          const mapInfo = result.data.content.point;
          const res = await this.weather(mapInfo);
          const data = res.data.result.realtime;
          let skycon = null;
          const obj = {
            CLEAR_DAY: '晴（白天）',
            CLEAR_NIGHT: '晴（夜间）',
            PARTLY_CLOUDY_DAY: '多云（白天）',
            PARTLY_CLOUDY_NIGHT: '多云（夜间）',
            CLOUDY: '阴',
            LIGHT_HAZE: '轻度雾霾',
            MODERATE_HAZE: '中度雾霾',
            HEAVY_HAZE: '重度雾霾',
            LIGHT_RAIN: '小雨',
            MODERATE_RAIN: '中雨',
            HEAVY_RAIN: '大雨',
            STORM_RAIN: '暴雨',
            FOG: '雾',
            LIGHT_SNOW: '小雪',
            MODERATE_SNOW: '中雪',
            HEAVY_SNOW: '大雪',
            STORM_SNOW: '暴雪',
            DUST: '浮尘',
            SAND: '沙尘',
            WIND: '大风',
          };
          Object.entries(obj).forEach((item) => {
            if (item.includes(data.skycon)) {
              skycon = item[1];
            }
          });
          return {
            code: 200,
            data: {
              address,
              temperature: data.temperature,
              skyconCn: skycon,
              skyconEn: data.skycon,
              pm25: data.air_quality.pm25,
            },
            message: '获取数据成功',
          };
        }
      })
      .catch((err) => {
        console.log(err, 'cityErr');
        return { code: 500, data: null, message: err };
      });
  }

  /**
   * 根据百度定位返回的经纬度调用彩云天气实时天气接口。
   */
  weather(mapInfo) {
    console.log(`${mapInfo.x},${mapInfo.y}`);
    return this.httpService
      .get(
        `https://api.caiyunapp.com/v2.6/WYpeiV7gkcvrcBp0/${mapInfo.x},${mapInfo.y}/realtime`,
      )
      .toPromise()
      .then((result) => {
        return result;
        // return { code: 200, data: result.data, message: '获取数据成功' };
      })
      .catch((err) => {
        console.log(err, 'weatherErr');
        return err;
      });
  }

  /**
   * 公共上传接口，文件保存到 public/uploads 根目录。
   */
  async uploadFile(file) {
    // 获取文件的后缀
    const ext = extname(file.originalname);
    const filename = `${file.fieldname}-${Date.now()}${ext}`;
    await this.createMkdir();
    const writeStream = createWriteStream(
      join(__dirname, '../public/uploads', filename),
    );
    writeStream.write(file.buffer);
    return {
      mimetype: file.mimetype,
      originalname: file.originalname,
      size: file.size,
      path: `/uploads/${filename}`,
    };
  }

  /**
   * 日记媒体上传，按图片或视频分别保存到 uploads/diary/images 或 videos。
   */
  async uploadDiaryFile(file) {
    return this.uploadTypedFile(file, 'diary');
  }

  /**
   * 作品媒体上传，按图片或视频分别保存到 uploads/project/images 或 videos。
   */
  async uploadProjectFile(file) {
    return this.uploadTypedFile(file, 'project');
  }

  /**
   * 简历文件上传，保存到私有目录，避免被未授权用户直接访问。
   */
  async uploadResumeFile(file) {
    const ext = extname(file.originalname);
    const filename = `${file.fieldname}-${Date.now()}${ext}`;
    const uploadDir = join(__dirname, '../private/uploads/resume/files');
    mkdirSync(uploadDir, { recursive: true });
    writeFileSync(join(uploadDir, filename), file.buffer);
    return {
      mimetype: file.mimetype,
      originalname: file.originalname,
      size: file.size,
      path: `/resume/files/${filename}`,
    };
  }

  /**
   * 日记和作品共用的分类媒体上传方法，按 mimetype 自动区分图片和视频目录。
   */
  private uploadTypedFile(file, folder: 'diary' | 'project') {
    const ext = extname(file.originalname);
    const mediaType = file.mimetype?.startsWith('video/') ? 'videos' : 'images';
    const filename = `${file.fieldname}-${Date.now()}${ext}`;
    const uploadDir = join(__dirname, '../public/uploads', folder, mediaType);
    mkdirSync(uploadDir, { recursive: true });
    writeFileSync(join(uploadDir, filename), file.buffer);
    return {
      mimetype: file.mimetype,
      originalname: file.originalname,
      size: file.size,
      path: `/uploads/${folder}/${mediaType}/${filename}`,
    };
  }

  /**
   * 确保公共上传目录存在，供旧公共上传接口写入文件。
   */
  createMkdir() {
    if (!existsSync(join(__dirname, '../public'))) {
      mkdirSync(join(__dirname, '../public'));
      if (!existsSync(join(__dirname, '../public/uploads'))) {
        mkdirSync(join(__dirname, '../public/uploads'));
      }
    } else {
      if (!existsSync(join(__dirname, '../public/uploads'))) {
        mkdirSync(join(__dirname, '../public/uploads'));
      }
    }
  }

  /**
   * 触发友链截图刷新，具体截图逻辑由友链服务维护。
   */
  async refreshScreenShot(data) {
    console.log(data);
    return await this.friendShipService.setScreenShot(data);
  }
}
