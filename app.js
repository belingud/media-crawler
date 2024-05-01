import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as compression from 'compression';
import { AppModule } from './src/app.module';
import { ValidationPipe } from '@nestjs/common';
// import { PORT } from './config';
import { LoggingInterceptor } from './src/logger.interceptor';

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create(AppModule, new ExpressAdapter());
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
bootstrap().then((c) => {
  const app = c;
  return app;
});
module.exports = app;
