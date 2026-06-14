import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export type AuthClient = 'admin' | 'miniapp';

export interface AuthTokenPayload {
  userId: number;
  username?: string;
  openid?: string;
  role?: string;
  permissions?: string[];
  client: AuthClient;
}

@Injectable()
export class AuthTokenService {
  constructor(private readonly jwtService: JwtService) {}

  sign(payload: AuthTokenPayload) {
    return this.jwtService.sign(payload);
  }

  signAdmin(payload: Omit<AuthTokenPayload, 'client'>) {
    return this.sign({ ...payload, client: 'admin' });
  }

  signMiniapp(payload: Omit<AuthTokenPayload, 'client'>) {
    return this.sign({ ...payload, client: 'miniapp' });
  }

  verify(token: string, client?: AuthClient) {
    if (!token) {
      throw new UnauthorizedException('登录已过期，请重新登录');
    }

    try {
      const payload = this.jwtService.verify<AuthTokenPayload>(token);
      if (client && payload.client !== client) {
        throw new UnauthorizedException('登录身份不匹配');
      }

      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('登录已过期，请重新登录');
    }
  }
}
