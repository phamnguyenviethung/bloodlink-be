import { Customer } from '@/database/entities/Account.entity';
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
export class ClerkStrategy extends PassportStrategy(Strategy, 'clerk') {
  private readonly logger = new Logger(ClerkStrategy.name);

  constructor(
    @Inject('ClerkClient')
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

      const customer = await em.findOne(Customer, {
        id: verifiedToken.sub,
      });

      if (!customer) {
        throw new UnauthorizedException('Customer not found');
      }

      req.user = customer;

      return customer;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(error);

      throw new UnauthorizedException('Authentication failed');
    }
  }
}
