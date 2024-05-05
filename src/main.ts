import { NestFactory } from '@nestjs/core';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggingInterceptor } from './logger.interceptor';
import * as express from 'express';
import * as fs from 'fs';
import * as https from 'https';

const dev = process.env.NODE_ENV !== 'production';

console.log('Environment: ', process.env.NODE_ENV);

async function bootstrap() {
  const server = express();
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(server),
  );
  app.enableCors();
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
    const httpsOptions = {
      key: fs.readFileSync(configService.get<string>('HTTPS_KEY')),
      cert: fs.readFileSync(configService.get<string>('HTTPS_CERT')),
    };
    // Use https in production env
    const httpsPort: number = configService.get<number>('HTTPS_PORT') || 443;
    https.createServer(httpsOptions, server).listen(httpsPort);
    console.log(`HTTPS application is running on port: ${httpsPort}`);
  }
}
bootstrap();
