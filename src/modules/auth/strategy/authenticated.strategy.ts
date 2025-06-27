import {
  Account,
  AccountRole,
  Admin,
  Customer,
  Hospital,
  Staff,
} from '@/database/entities/Account.entity';
import { ClerkClientType } from '@/share/providers/clerk.provider';
import { RequestWithUser } from '@/share/types/request.type';
import { ClerkClient } from '@clerk/backend';
import { MikroORM } from '@mikro-orm/core';
import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';

@Injectable()
export class AuthenticatedStrategy extends PassportStrategy(
  Strategy,
  'authenticated',
) {
  private readonly logger = new Logger(AuthenticatedStrategy.name);

  constructor(
    @Inject(ClerkClientType.CLIENT)
    private readonly clerkClient: ClerkClient,
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

      let entity: any;
      switch (account.role) {
        case AccountRole.HOSPITAL:
          entity = Hospital;
          break;
        case AccountRole.STAFF:
          entity = Staff;
          break;
        case AccountRole.ADMIN:
          entity = Admin;
          break;
        case AccountRole.USER:
          entity = Customer;
          break;
        default:
          throw new UnauthorizedException('Invalid account role');
      }

      const data = await em.findOne(entity, {
        id: account.id,
      });

      if (!data) {
        throw new UnauthorizedException('Account not found');
      }

      req.user = data as Customer | Hospital | Staff | Admin;

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
