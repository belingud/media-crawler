import {
    Controller,
    Get,
    Query,
    BadRequestException,
    ParseBoolPipe,
    Inject,
    Logger,
    DefaultValuePipe,
} from '@nestjs/common';
import { ApiService } from './api.service';
import { CACHE_MANAGER, CacheStore } from '@nestjs/cache-manager';
import { QueryCache } from 'src/decorators/query-cache.decorstor';

@Controller('/')
export class ApiController {
    // 使用nestjs默认的logger
    constructor(
        private readonly appService: ApiService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: CacheStore,
        private readonly logger: Logger,
    ) {}

    @Get('/hyperparse')
    @QueryCache()
    async getInfo(
        @Query('url') url: string,
        @Query('minimal', new DefaultValuePipe(true), ParseBoolPipe) minimal: boolean = false,
    ) {
        if (!url) {
            throw new BadRequestException('Url is required');
        }
        let data = await this.appService.hybridParsing(url)
        if (minimal) {
            data = this.appService.getMinimalData(data);
        }
        return data;
    }
}
