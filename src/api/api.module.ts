import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { HttpModule } from '@nestjs/axios';
import { DouYinCrawler } from './crawler/douyin.crawler';
import { TikTokCrawler } from './crawler/tiktok.crawler';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [ApiController],
  providers: [ApiService, DouYinCrawler, TikTokCrawler],
  // exports: [ApiService],
})
export class ApiModule {}
