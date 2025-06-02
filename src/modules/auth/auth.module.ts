import {
  ClerkAdminClientProvider,
  ClerkClientProvider,
} from '@/share/providers/clerk.provider';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ClerkStrategy } from './strategy/clerk.strategy';
import { HttpModule } from '@nestjs/axios';
import { ClerkAdminStrategy } from './strategy/clerkAdmin.strategy';

@Module({
  controllers: [AuthController],
  imports: [PassportModule, ConfigModule, JwtModule.register({}), HttpModule],
  providers: [
    ClerkStrategy,
    ClerkAdminStrategy,
    ClerkClientProvider,
    AuthService,
    ClerkAdminClientProvider,
  ],
})
export class AuthModule {}
