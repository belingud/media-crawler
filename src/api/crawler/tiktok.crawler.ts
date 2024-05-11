import { AxiosProxyConfig, AxiosRequestConfig } from 'axios';
import { BaseCrawler } from './base.crawler';
import { lastValueFrom, map } from 'rxjs';
import { TikTokApiUrl } from 'src/api.config';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CONFIGURATION_SERVICE_TOKEN } from '@nestjs/config/dist/config.constants';

const logger: Logger = new Logger('TikTokCrawler');

@Injectable()
export class TikTokCrawler extends BaseCrawler {
    constructor(
        protected readonly http: HttpService,

        @Inject(CONFIGURATION_SERVICE_TOKEN)
        protected readonly config: ConfigService,
    ) {
        super(http);
    }
    #tiktokHeaders: object = {
        'User-Agent':
            'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36',
    };
    getOfficialAPIUrl(awemeID: string): object {
        return {
            'User-Agent': this.#tiktokHeaders['User-Agent'],
            api_url: `https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?aweme_id=${awemeID}`,
        };
    }
    async getAwemeID(text: string): Promise<string> {
        let url = await this.convertShareUrl(text);
        let awemeID: string;
        if (url.includes('/video/')) {
            awemeID = url.match(/\/video\/(\d+)/i)[1];
        } else if (url.includes('/v/')) {
            awemeID = url.match(/\/v\/(\d+)/i)[1];
        }
        return awemeID;
    }

    async getAwemeData(awemeID: string): Promise<object> {
        const queryParams = {
            iid: '7318518857994389254',
            device_id: '7318517321748022790',
            channel: 'googleplay',
            app_name: 'musical_ly',
            version_code: '300904',
            device_platform: 'android',
            device_type: 'ASUS_Z01QD',
            os_version: '9',
            aweme_id: awemeID,
        };
        const paramsString: string = new URLSearchParams(
            queryParams,
        ).toString();
        const axiosConfig: AxiosRequestConfig = {
            headers: this.#tiktokHeaders,
        };
        if (this.config.get('DEFAULT_PROXY')) {
            axiosConfig['proxy'] = this.config.get<AxiosProxyConfig>(
                'DEFAULT_PROXY_CONFIG',
            );
        }
        const detailUrl = `${TikTokApiUrl}?${paramsString}`;
        console.debug('detailUrl : ', detailUrl);
        let data = await lastValueFrom(
            this.http.get(detailUrl, axiosConfig).pipe(map((res) => res.data)),
        ).catch((error) => {
            logger.log(error);
            throw new NotFoundException('Media not found');
        });
        const awemeData = data['aweme_list'][0];
        if (awemeID != awemeData['aweme_id']) {
            throw new NotFoundException('Media not found');
        }
        return awemeData;
    }
}
