import { CustomerModule } from '@/modules/customer/customer.module';
import { ExpressAdapter } from '@bull-board/express';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import * as Joi from 'joi';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import * as path from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { GlobalExceptionFilter } from './share/filters/globalException.filter';
import { TransformInterceptor } from './share/interceptors/apiResponse.interceptor';
import {
  ClerkAdminClientProvider,
  ClerkClientProvider,
} from './share/providers/clerk.provider';

import { BullBoardModule } from '@bull-board/nestjs';
import { MikroORM } from '@mikro-orm/core';
import { BullModule } from '@nestjs/bullmq';
import { AppZodValidationPipe } from './share/pipes/zodError.pipe';
import config from './mikro-orm.config';
@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        NODE_ENV: Joi.valid('development', 'production').default('development'),
        PORT: Joi.number().default(5678),

        CLERK_SECRET_KEY: Joi.string().required(),
        CLERK_PUBLISHABLE_KEY: Joi.string().required(),
        CLERK_CUSTOM_JWT_SECRET: Joi.string().required(),
        CLERK_WEBHOOK_SIGNING_SECRET: Joi.string().required(),

        CLERK_ADMIN_SECRET_KEY: Joi.string().required(),
        CLERK_ADMIN_PUBLISHABLE_KEY: Joi.string().required(),
        CLERK_ADMIN_CUSTOM_JWT_SECRET: Joi.string().required(),
        CLERK_ADMIN_WEBHOOK_SIGNING_SECRET: Joi.string().required(),

        NGROK_URL: Joi.string(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
        REDIS_PASSWORD: Joi.string().required(),
        REDIS_USERNAME: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        DB_USER: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
      }),
      validationOptions: {
        abortEarly: false,
      },
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'development' ? '.env.dev' : '.env',
      cache: true,
      expandVariables: true,
    }),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST');
        return {
          connection: {
            family: 0,
            host: host,
            port: configService.get<number>('REDIS_PORT'),
            password: configService.get<string>('REDIS_PASSWORD') || undefined,
          },
        };
      },
      inject: [ConfigService],
    }),
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
    }),
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        ...config,
        dbName: configService.get<string>('DB_NAME'),
        user: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT')),
      }),
      inject: [ConfigService],
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
      typesOutputPath: path.join(
        __dirname,
        '../src/generated/i18n.generated.ts',
      ),
    }),
    AuthModule,
    CustomerModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ClerkClientProvider,
    ClerkAdminClientProvider,
    {
      provide: APP_PIPE,
      useClass: AppZodValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly orm: MikroORM) {}

  async onModuleInit(): Promise<void> {
    await this.orm.getMigrator().up();
  }
}
