import {
  Account,
  AccountRole,
  Admin,
  Staff,
} from '@/database/entities/account.entity';
import { RequestWithUser } from '@/share/types/request.type';
import { MikroORM } from '@mikro-orm/core';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';

@Injectable()
export class ClerkAdminStrategy extends PassportStrategy(
  Strategy,
  'clerkAdmin',
) {
  private readonly logger = new Logger(ClerkAdminStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly orm: MikroORM,
  ) {
    super();
  }

  async validate(req: RequestWithUser): Promise<any> {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      const verifiedToken = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('CLERK_CUSTOM_JWT_SECRET'),
      });

      if (!verifiedToken) {
        throw new UnauthorizedException('Invalid token');
      }

      const em = this.orm.em.fork();

      const account = await em.findOne(Account, {
        id: verifiedToken.sub,
      });

      if (!account) {
        throw new UnauthorizedException('Account not found');
      }

      const entity = AccountRole.ADMIN === account.role ? Admin : Staff;

      const data = await em.findOne(entity, {
        id: account.id,
      });

      if (!data) {
        throw new UnauthorizedException('Account not found');
      }
      req.user = data;

      return data;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(error);

      throw new UnauthorizedException('Authentication failed');
    }
  }
}
