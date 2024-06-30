import 'dotenv/config';
import http from 'http';
import { NestFactory } from '@nestjs/core';
import { NestApplicationOptions, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { logger, loggerService } from './logger';
import { HttpExceptionFilter } from './app.filter';

console.log('Environment: ', process.env.NODE_ENV);

async function bootstrap() {
    let options: NestApplicationOptions = { cors: true };
    const app = await NestFactory.create(AppModule);
    app.enableCors({
        origin: '*',
        methods: '*',
        credentials: true,
        allowedHeaders: '*',
        maxAge: 36000,
        preflightContinue: true,
        optionsSuccessStatus: 200,
    });
    app.useGlobalPipes(new ValidationPipe());
    app.useLogger(loggerService);
    app.useGlobalInterceptors(new LoggingInterceptor(logger));
    app.useGlobalFilters(new HttpExceptionFilter(logger));
    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT');
    await app.listen(port || 3000);
    logger.info(`HTTP application is running on: ${await app.getUrl()}`);
}
bootstrap();
