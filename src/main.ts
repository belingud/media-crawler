import 'dotenv/config';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NestFactory } from '@nestjs/core';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { NestApplicationOptions, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggingInterceptor } from './logger.interceptor';
import { configInstance } from './config/configuration';
import * as fs from 'fs';
import * as path from 'path';

const dev = process.env.NODE_ENV !== 'production';

console.log('Environment: ', process.env.NODE_ENV);

async function bootstrap() {
  let options: NestApplicationOptions = { cors: true };
  if (!dev) {
    console.log(__dirname);
    options.httpsOptions = {
      key: fs.readFileSync(
        path.join(__dirname, '../../' + process.env.HTTPS_KEY),
      ),
      cert: fs.readFileSync(
        path.join(__dirname, '../../' + process.env.HTTPS_CERT),
      ),
    };
  }
  const app = await NestFactory.create(AppModule, options);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.use(
    compression({
      filter: () => {
        return true; // always compress
      },
      threshold: -1, // default
    }),
  );
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT');
  if (dev) {
    // Use http in development env
    await app.listen(port || 3000);
    console.log(`HTTP application is running on: ${await app.getUrl()}`);
  } else {
    // Use https in production env
    const httpsPort: number = configService.get<number>('HTTPS_PORT') || 8000;
    await app.listen(httpsPort);
    console.log(`HTTPS application is running on port: ${await app.getUrl()}`);
  }
}
bootstrap();
