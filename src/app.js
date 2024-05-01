import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { PORT } from './config';
import { LoggingInterceptor } from './logger.interceptor';

function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  const app = NestFactory.create(AppModule, new ExpressAdapter());
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
  return app;
}
const app = bootstrap();
module.exports = app;
