import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { NestFactory } from '@nestjs/core';
import { NestApplicationOptions, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';
import { LoggingInterceptor } from './logging.interceptor';
import { logger, loggerService } from './logger';

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
    app.useLogger(loggerService);
    app.useGlobalInterceptors(new LoggingInterceptor(logger));
    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT');
    if (dev) {
        // Use http in development env
        await app.listen(port || 3000);
        logger.info(`HTTP application is running on: ${await app.getUrl()}`);
    } else {
        // Use https in production env
        const httpsPort: number =
            configService.get<number>('HTTPS_PORT') || 8000;
        await app.listen(httpsPort);
        logger.info(
            `HTTPS application is running on port: ${await app.getUrl()}`,
        );
    }
}
bootstrap();

