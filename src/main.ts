import { NestFactory } from '@nestjs/core';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggingInterceptor } from './logger.interceptor';
import * as fs from 'fs';
import * as path from 'path';
import { HttpsOptions } from '@nestjs/common/interfaces/external/https-options.interface';

const dev = process.env.NODE_ENV !== 'production';

console.log('Environment: ', process.env.NODE_ENV);

async function bootstrap() {
  let httpsOptions: HttpsOptions = {};
  if (!dev) {
    console.log(__dirname);
    httpsOptions = {
      key: fs.readFileSync(
        path.join(__dirname, '../../src/secret/privkey.pem'),
      ),
      cert: fs.readFileSync(
        path.join(__dirname, '../../src/secret/fullchain.pem'),
      ),
    };
  }
  const app = await NestFactory.create(AppModule, {
    httpsOptions: httpsOptions,
    // cors: true,
  });
  app.enableCors({
    origin: '*', // 允许访问的域
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // 允许的HTTP请求方法
    allowedHeaders: 'Content-Type, Accept', // 允许的HTTP请求头
    credentials: true, // 控制是否应该暴露给前端JavaScript代码
  });
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
  const port = configService.get<number>('port');
  if (dev) {
    // Use http in development env
    await app.listen(port || 3000);
    console.log(`HTTP application is running on: ${await app.getUrl()}`);
  } else {
    // Use https in production env
    const httpsPort: number = configService.get<number>('https_port') || 8000;
    await app.listen(httpsPort);
    console.log(`HTTPS application is running on port: ${httpsPort}`);
  }
}
bootstrap();
