import { Logger as AppLogger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import * as morgan from 'morgan';
import { WinstonModule } from 'nest-winston';
import { patchNestJsSwagger } from 'nestjs-zod';
import { AppModule } from './app.module';
import { configSwagger } from './configs/apiDocs.config';
import winstonInstance from './configs/winston.config';

async function bootstrap() {
  const logger = new AppLogger(bootstrap.name);

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    logger: WinstonModule.createLogger({
      instance: winstonInstance,
    }),
    cors: true,
  });
  patchNestJsSwagger();
  configSwagger(app);
  const configService = app.get(ConfigService);
  app.use(morgan('dev'));
  app.use(cookieParser());

  await app.listen(configService.get('PORT'), () => {
    logger.log(
      `Server running on http://localhost:${configService.get('PORT')}`,
    );
    logger.log(
      `API Docs http://localhost:${configService.get('PORT')}/api-docs`,
    );
  });
}
bootstrap();
