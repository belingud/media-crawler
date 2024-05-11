import { Test, TestingModule } from '@nestjs/testing';
import { ApiService } from './api.service';
import { ApiController } from './api.controller';
import { HttpModule } from '@nestjs/axios';
import { INestApplication } from '@nestjs/common';

describe('ApiService', () => {
    let service: ApiService;

    beforeEach(async () => {
        let app: INestApplication;
        const module: TestingModule = await Test.createTestingModule({
            imports: [HttpModule],
            controllers: [ApiController],
            providers: [ApiService],
        }).compile();
        app = module.createNestApplication();
        await app.init();

        service = module.get<ApiService>(ApiService);
        console.log(service);
    });

    // it('should convert valid Douyin URL with v.douyin', () => {
    //   const inputText =
    //     'Check out this Douyin video: https://v.douyin.com/abc123';
    //   console.log(inputText);
    //   const convertedUrl = service.convertShareUrl(inputText);
    //   expect(convertedUrl).toBe('https://v.douyin.com/abc123');
    // });

    // it('should return the URL without conversion for valid Douyin URL without v.douyin', () => {
    //   const inputText = 'Another Douyin video: https://douyin.com/xyz789';
    //   const convertedUrl = service.convertShareUrl(inputText);
    //   expect(convertedUrl).toBe('https://douyin.com/xyz789');
    // });

    // it('should return the URL as is for non-Douyin URLs', () => {
    //   const inputText = 'This is a regular URL: https://example.com';
    //   const convertedUrl = service.convertShareUrl(inputText);
    //   expect(convertedUrl).toBe('https://example.com');
    // });

    // it('should return success', async () => {
    //   const inputText = '7356162779423853824';
    //   console.log(inputText);
    //   const output = await service.getDouYinAwemeData(inputText);
    //   console.log(output);
    // });
});
