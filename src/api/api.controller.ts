import {
  Controller,
  Get,
  Req,
  Request,
  Query,
  BadRequestException,
  HttpStatus,
  Res,
  InternalServerErrorException,
  ParseBoolPipe,
} from '@nestjs/common';
import { ApiService } from './api.service';
import { Response } from 'express';

@Controller('/')
export class ApiController {
  constructor(private readonly appService: ApiService) {}

  @Get('/api')
  async getInfo(
    @Res() res: Response,
    @Query('url') url: string,
    @Query('minimal', ParseBoolPipe) minimal: boolean = false,
  ) {
    if (!url) {
      throw new BadRequestException('Url is required');
    }
    await this.appService
      .hybridParsing(url)
      .then((data) => {
        if (minimal) {
          data = this.appService.getMinimalData(data);
        }
        res.status(HttpStatus.OK).json(data);
      })
      .catch((err) => {
        console.log(`Parse url error: ${err}`);
        throw new InternalServerErrorException('Parse url error');
      });
  }
}
