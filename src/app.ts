import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as compression from 'compression';
import express from 'express';
import { AppModule } from './app.module';
import { Injectable, NestMiddleware, ValidationPipe } from '@nestjs/common';
// import { PORT } from './config';
import { LoggingInterceptor } from './logger.interceptor';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  const expressApp = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );
  await app.init();
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
// const app = bootstrap();
// module.exports = app;

const createNest = async (express: Express.Application) => {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(express));
  await app.init();
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.use(compression());
  return app;
};

@Injectable()
export class AppMiddleware implements NestMiddleware {
  constructor(private expressInstance: Express.Application) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  use(req: any, res: any, next: () => void) {
    console.log('In Nest middleware');
    return createNest(this.expressInstance);
  }
}
module.exports = AppMiddleware;
