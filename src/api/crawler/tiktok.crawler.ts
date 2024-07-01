import { AxiosProxyConfig, AxiosRequestConfig, AxiosResponse } from 'axios';
import { BaseCrawler } from './base.crawler';
import { firstValueFrom, lastValueFrom, map } from 'rxjs';
import { TikTokApiUrl, TikTokCookie, UserAgent } from '../../api.config';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CONFIGURATION_SERVICE_TOKEN } from '@nestjs/config/dist/config.constants';
import { PlaywrightService } from 'src/playwright/playwright.service';
import { GeoCodeEnum } from 'src/playwright/playwright.enum';

const logger: Logger = new Logger('TikTokCrawler');

@Injectable()
export class TikTokCrawler extends BaseCrawler {
    constructor(
        protected readonly http: HttpService,

        @Inject(CONFIGURATION_SERVICE_TOKEN)
        protected readonly config: ConfigService,
        protected readonly playwright: PlaywrightService
    ) {
        super(http);
    }
    #tiktokHeaders: object = {
        'User-Agent': UserAgent,
        Referer: 'https://www.tiktok.com/',
        Cookie: TikTokCookie,
    };

    #docHeaders: object = {
        // 'User-Agent': UserAgent,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        Host: 'www.tiktok.com',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    };
    #documentH: object = {
        Host: 'www.tiktok.com',
        'User-Agent': UserAgent,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        Connection: 'keep-alive',
        // Cookie: TikTokCookie,
        Priority: 'u=1',
    };

    #downloadHeaders: object = {
        'User-Agent': UserAgent,
        Accept: '*/*',
        'Sec-Fetch-Mode': 'navigate',
        'Accept-Encoding': 'identity',
        Referer: 'https://www.tiktok.com/',
        'Accept-Language': 'en-us,en;q=0.5',
    };

    #videoPageUrl: string = 'https://tiktok.com/@/<username>/video/<aweme_id>';
    // 匹配<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__">...</script>中的json数据
    #videoInfoPattern: RegExp =
        /<script[^>]*\bid="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>(.*?)<\/script>/s;

    getParams() {
        const hex = this.generateRandomHex('0123456789abcdef', 16);
    }
    getOfficialAPIUrl(awemeID: string): object {
        return {
            'User-Agent': this.#tiktokHeaders['User-Agent'],
            api_url: `https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?aweme_id=${awemeID}`,
        };
    }
    async getAwemeID(text: string): Promise<string> {
        let url = await this.convertShareUrl(text);
        return url;
        let awemeID: string;
        if (url.includes('/video/')) {
            awemeID = url.match(/\/video\/(\d+)/i)[1];
        } else if (url.includes('/v/')) {
            awemeID = url.match(/\/v\/(\d+)/i)[1];
        }
        return awemeID;
    }
    async OLDgetAwemeData(awemeID: string, url?: string): Promise<object> {
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
        if (!data) {
            throw new NotFoundException('Media not found');
        }
        const awemeData = data['aweme_list'][0];
        if (awemeID != awemeData['aweme_id']) {
            throw new NotFoundException('Media not found');
        }
        return awemeData;
    }

    async getAwemeData(awemeID: string, url: string): Promise<object> {
        if (!url.includes(awemeID)) {
            throw new NotFoundException('Media not found');
        }
        // const queryParams = {
        //     iid: '7318518857994389254',
        //     device_id: '7318517321748022790',
        //     channel: 'googleplay',
        //     app_name: 'musical_ly',
        //     version_code: '300904',
        //     device_platform: 'android',
        //     device_type: 'ASUS_Z01QD',
        //     os_version: '9',
        //     aweme_id: awemeID,
        // };
        // const paramsString: string = new URLSearchParams(
        //     queryParams
        // ).toString();
        const content = await this.playwright.getContent({
            headless: false,
            url: url,
            proxy: this.config.get<string>("PROXY_STRING"),
            geolocation: GeoCodeEnum.Singapore
        });
        if (!content) {
            throw new NotFoundException('Media not found');
        }
        const match: RegExpMatchArray = this.#videoInfoPattern.exec(content);
        if (!match) {
            throw new NotFoundException('Media not found');
        }
        const awemeData = JSON.parse(match[1]);
        if (
            awemeData &&
            awemeData['__DEFAULT_SCOPE__'] &&
            awemeData['__DEFAULT_SCOPE__']['webapp.video-detail']
        ) {
            return awemeData['__DEFAULT_SCOPE__']['webapp.video-detail'];
        }
        return undefined;
    }

    generateRandomHex(characters: string, length: number): string {
        let result = '';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(
                Math.floor(Math.random() * charactersLength)
            );
        }
        return result;
    }

    formatData(awemeData: object): object | PromiseLike<object> {
        const item: object = awemeData['itemInfo']['itemStruct'] || {};
        const video = item['video'] || {};
        const type: string = video['duration'] ? 'video' : 'image';
        const data: object = {
            status: 'success',
            message: '',
            type: type,
            platform: 'tiktok',
            aweme_id: item['id'],
            official_api_url: this.getOfficialAPIUrl(item['id']),
            desc: item['desc'],
            create_time: item['create_time'],
            author: item['author'],
            music: item['music'],
            statistics: {},
            cover_data: {
                cover: { url_list: [video['cover']] },
                origin_cover: { url_list: [video['originCover']] },
                dynamic_cover: { url_list: [video['dynamicCover']] },
            },
            hashtags: item['textExtra'] || [],
            video_data: {
                wm_video_url: video['downloadAddr'],
                wm_video_url_list: [video['downloadAddr']],
                wm_video_url_HQ: video['downloadAddr'],
                wm_video_url_HQ_list: [video['downloadAddr']],
                nwm_video_url: video['playAddr'],
                nwm_video_url_list: [video['playAddr']],
                nwm_video_url_HQ: video['playAddr'],
                nwm_video_url_HQ_list: [video['playAddr']],
            },
        };
        return data;
    }
}
