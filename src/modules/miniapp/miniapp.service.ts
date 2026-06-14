import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { Repository } from 'typeorm';
import { AuthTokenService } from '../../auth/auth-token.service';
import { CreateToolUsageDto } from './dto/create-tool-usage.dto';
import { MiniappToolUsage } from './entities/miniapp-tool-usage.entity';
import { MiniappUser } from './entities/miniapp-user.entity';

interface Code2SessionResponse {
  openid?: string;
  session_key?: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

interface Code2SessionSuccess {
  openid: string;
  session_key?: string;
  unionid?: string;
}

@Injectable()
export class MiniappService {
  constructor(
    @InjectRepository(MiniappUser)
    private miniappUserRepository: Repository<MiniappUser>,
    @InjectRepository(MiniappToolUsage)
    private miniappToolUsageRepository: Repository<MiniappToolUsage>,
    private configService: ConfigService,
    private authTokenService: AuthTokenService,
  ) {}

  async wechatLogin(code: string) {
    const session = await this.code2Session(code);
    const user = await this.findOrCreateUser(session);
    const token = this.authTokenService.signMiniapp({
      userId: user.id,
      role: user.role,
    });

    return {
      token,
      user: this.serializeUser(user),
    };
  }

  async verifySession(token: string) {
    const payload = this.authTokenService.verify(token, 'miniapp');
    const user = await this.withTransientDbRetry(() =>
      this.miniappUserRepository.findOne({
        where: { id: payload.userId },
      }),
    );

    if (!user) {
      throw new UnauthorizedException('登录已过期，请重新登录');
    }

    return {
      valid: true,
      user: this.serializeUser(user),
    };
  }

  async createToolUsage(token: string, payload: CreateToolUsageDto) {
    return this.withTransientDbRetry(() =>
      this.createToolUsageOnce(token, payload),
    );
  }

  private async createToolUsageOnce(
    token: string,
    payload: CreateToolUsageDto,
  ) {
    const user = await this.getUserByToken(token);
    const existedUsage = await this.miniappToolUsageRepository.findOne({
      where: {
        userId: user.id,
        toolKey: payload.toolKey,
      },
    });

    const toolUsage = existedUsage || this.miniappToolUsageRepository.create({
      userId: user.id,
      toolKey: payload.toolKey,
    });

    toolUsage.toolTitle = payload.toolTitle;
    toolUsage.entryType = payload.entryType || 'open';
    toolUsage.createTime = new Date();
    const savedUsage = await this.miniappToolUsageRepository.save(toolUsage);

    return this.serializeToolUsage(savedUsage);
  }

  async getToolUsages(token: string) {
    return this.withTransientDbRetry(() => this.getToolUsagesOnce(token));
  }

  private async getToolUsagesOnce(token: string) {
    const user = await this.getUserByToken(token);
    const usages = await this.miniappToolUsageRepository.find({
      where: { userId: user.id },
      order: { createTime: 'DESC' },
      take: 50,
    });
    const latestUsages = new Map<string, MiniappToolUsage>();

    for (const usage of usages) {
      if (!latestUsages.has(usage.toolKey)) {
        latestUsages.set(usage.toolKey, usage);
      }
    }

    return Array.from(latestUsages.values()).map((usage) =>
      this.serializeToolUsage(usage),
    );
  }

  private async getUserByToken(token: string) {
    const payload = this.authTokenService.verify(token, 'miniapp');
    const user = await this.miniappUserRepository.findOne({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new UnauthorizedException('登录已过期，请重新登录');
    }

    return user;
  }

  private async code2Session(code: string): Promise<Code2SessionSuccess> {
    const appid = this.getWechatConfigValue('WECHAT_MINIAPP_APPID');
    const secret = this.getWechatConfigValue('WECHAT_MINIAPP_SECRET');

    if (!appid || !secret) {
      throw new InternalServerErrorException('微信小程序登录配置缺失');
    }

    if (!code) {
      throw new UnauthorizedException('缺少微信登录 code');
    }

    const params = new URLSearchParams({
      appid,
      secret,
      js_code: code,
      grant_type: 'authorization_code',
    });
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    let response: Response;
    let data: Code2SessionResponse;

    try {
      response = await fetch(
        `https://api.weixin.qq.com/sns/jscode2session?${params.toString()}`,
        { signal: controller.signal },
      );
      data = (await response.json()) as Code2SessionResponse;
    } catch {
      throw new UnauthorizedException('微信登录请求超时，请稍后重试');
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok || data.errcode || !data.openid) {
      throw new UnauthorizedException(data.errmsg || '微信登录失败');
    }

    return {
      openid: data.openid,
      session_key: data.session_key,
      unionid: data.unionid,
    };
  }

  private getWechatConfigValue(key: string) {
    const runtimeValue = this.configService.get<string>(key)?.trim();
    if (runtimeValue) {
      return runtimeValue;
    }

    const envNames = [
      `.env.${process.env.NODE_ENV || 'development'}`,
      '.env',
    ];

    for (const envName of envNames) {
      const envPath = path.resolve(process.cwd(), envName);
      if (!fs.existsSync(envPath)) {
        continue;
      }

      const parsed = dotenv.parse(fs.readFileSync(envPath));
      const fileValue = parsed[key]?.trim();
      if (fileValue) {
        return fileValue;
      }
    }

    return '';
  }

  private async findOrCreateUser(session: Code2SessionSuccess) {
    return this.withTransientDbRetry(() => this.findOrCreateUserOnce(session));
  }

  private async findOrCreateUserOnce(session: Code2SessionSuccess) {
    let user = await this.miniappUserRepository.findOne({
      where: { openid: session.openid },
    });

    if (!user) {
      user = this.miniappUserRepository.create({
        openid: session.openid,
        unionid: session.unionid || '',
      });
    } else if (session.unionid && user.unionid !== session.unionid) {
      user.unionid = session.unionid;
    }

    await this.ensureUserIdentity(user);
    user.lastLoginTime = new Date();
    return this.miniappUserRepository.save(user);
  }

  private async ensureUserIdentity(user: MiniappUser) {
    if (!user.username) {
      user.username = await this.createUniqueUsername();
    }

    if (!user.userCode) {
      user.userCode = await this.createUniqueUserCode();
    }
  }

  private async createUniqueUsername() {
    for (let index = 0; index < 10; index += 1) {
      const username = `小千${this.createRandomText(6)}`;
      const existed = await this.miniappUserRepository.findOne({
        where: { username },
      });

      if (!existed) {
        return username;
      }
    }

    throw new InternalServerErrorException('生成用户名失败，请稍后重试');
  }

  private async createUniqueUserCode() {
    for (let index = 0; index < 10; index += 1) {
      const userCode = this.createRandomNumber(8);
      const existed = await this.miniappUserRepository.findOne({
        where: { userCode },
      });

      if (!existed) {
        return userCode;
      }
    }

    throw new InternalServerErrorException('生成用户 ID 失败，请稍后重试');
  }

  private createRandomText(length: number) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let text = '';

    for (let index = 0; index < length; index += 1) {
      text += chars[Math.floor(Math.random() * chars.length)];
    }

    return text;
  }

  private createRandomNumber(length: number) {
    let text = '';

    for (let index = 0; index < length; index += 1) {
      text += Math.floor(Math.random() * 10);
    }

    return text;
  }

  private isTransientDbError(error: unknown) {
    const databaseError = error as {
      code?: string;
      errno?: number;
      driverError?: { code?: string; errno?: number };
    };
    const code = databaseError.driverError?.code || databaseError.code;
    const transientCodes = [
      'ECONNRESET',
      'PROTOCOL_CONNECTION_LOST',
      'ETIMEDOUT',
      'ECONNREFUSED',
    ];

    return Boolean(code && transientCodes.includes(code));
  }

  private async withTransientDbRetry<T>(operation: () => Promise<T>) {
    try {
      return await operation();
    } catch (error) {
      if (!this.isTransientDbError(error)) {
        throw error;
      }

      await this.delay(200);
      return operation();
    }
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private serializeUser(user: MiniappUser) {
    return {
      id: user.id,
      nickName: user.nickName,
      avatarUrl: user.avatarUrl,
      username: user.username,
      userCode: user.userCode,
      role: user.role,
    };
  }

  private serializeToolUsage(usage: MiniappToolUsage) {
    return {
      id: usage.id,
      toolKey: usage.toolKey,
      toolTitle: usage.toolTitle,
      entryType: usage.entryType,
      createdAt: usage.createTime,
    };
  }
}
