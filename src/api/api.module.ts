import { Logger, Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { HttpModule } from '@nestjs/axios';
import { DouYinCrawler } from './crawler/douyin.crawler';
import { TikTokCrawler } from './crawler/tiktok.crawler';
import { httpOptions } from '../options/http.options';
import { PlaywrightService } from 'src/playwright/playwright.service';

@Module({
    imports: [HttpModule.register(httpOptions)],
    controllers: [ApiController],
    providers: [ApiService, DouYinCrawler, TikTokCrawler, Logger, PlaywrightService],
    // exports: [ApiService],
})
export class ApiModule {}
