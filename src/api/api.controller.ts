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
} from '@nestjs/common';
import { ApiService } from './api.service';
import { Response } from 'express';
import { CACHE_MANAGER, CacheStore } from '@nestjs/cache-manager';
import { generateMD5Hash } from 'src/pkg/util';

@Controller('/')
export class ApiController {
  constructor(
    private readonly appService: ApiService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: CacheStore,
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
    const key = generateMD5Hash(`url:${url},minimal:${minimal}`);
    const value = await this.cacheManager.get(key);
    console.log(value);
    if (value) {
      return value;
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
        console.log(`Parse url error: ${err}`);
        throw new InternalServerErrorException('Parse url error');
      });
  }
}
