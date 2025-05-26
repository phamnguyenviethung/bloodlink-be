import { ClerkClientProvider } from '@/share/providers/clerk.provider';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ClerkStrategy } from './strategy/clerk.strategy';

@Module({
  controllers: [AuthController],
  imports: [PassportModule, ConfigModule, JwtModule.register({})],
  providers: [ClerkStrategy, ClerkClientProvider, AuthService],
})
export class AuthModule {}
