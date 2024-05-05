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
import * as path from 'path';
import * as https from 'https';

const dev = process.env.NODE_ENV !== 'production';

console.log('Environment: ', process.env.NODE_ENV);

const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, '../../src/secret/privkey.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../../src/secret/fullchain.pem')),
};

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
  const port = configService.get('PORT');
  if (dev) {
    await app.listen(port || 3000);
    console.log(`HTTP application is running on: ${await app.getUrl()}`);
  }
  const httpsPort: number = configService.get('HTTPS_PORT') || 443;
  https.createServer(httpsOptions, server).listen(httpsPort);
  console.log(`HTTPS application is running on port: ${httpsPort}`);
}
bootstrap();
