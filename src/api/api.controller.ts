import {
    Controller,
    Get,
    Query,
    BadRequestException,
    HttpStatus,
    Res,
    InternalServerErrorException,
    ParseBoolPipe,
    Inject,
    Logger,
} from '@nestjs/common';
import { ApiService } from './api.service';
import { Response } from 'express';
import { CACHE_MANAGER, CacheStore } from '@nestjs/cache-manager';
import { genMD5Hash } from 'src/pkg/util';

@Controller('/')
export class ApiController {
    // 使用nestjs默认的logger
    constructor(
        private readonly appService: ApiService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: CacheStore,
        private readonly logger: Logger,
    ) {}

    @Get('/hyperparse')
    async getInfo(
        @Res() res: Response,
        @Query('url') url: string,
        @Query('minimal', ParseBoolPipe) minimal: boolean = false,
    ) {
        if (!url) {
            throw new BadRequestException('Url is required');
        }
        const key = genMD5Hash(`url:${url},minimal:${minimal}`);
        const value = await this.cacheManager.get(key);
        if (value) {
            return res.status(HttpStatus.OK).json(value);
        }
        await this.appService
            .hybridParsing(url)
            .then((data) => {
                if (minimal) {
                    data = this.appService.getMinimalData(data);
                }
                this.cacheManager.set(key, data);
                res.status(HttpStatus.OK).json(data);
            })
            .catch((err) => {
                this.logger.error(`Parse url error: ${err}`);
                throw new InternalServerErrorException('Parse url error');
            });
    }
}
