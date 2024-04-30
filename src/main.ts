import { NestFactory } from '@nestjs/core';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { PORT } from './config';
import { LoggingInterceptor } from './logger.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
  await app.listen(PORT);
}
bootstrap();
