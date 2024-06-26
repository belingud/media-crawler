import { HttpService } from '@nestjs/axios';
import {
    HttpException,
    HttpStatus,
    Injectable,
    Logger,
} from '@nestjs/common';
import { firstValueFrom, lastValueFrom, map } from 'rxjs';
import { AxiosRequestConfig } from 'axios';
import { findUrl, genParams, generateXBogus } from '../common/util';
import { DouYinCookies, TikTokApiUrl, UserAgent } from '../api.config';
// import { XBogus } from '../pkg/xbogus';
// import { genMSToken } from './tokenManager';
import { getDouyinDetailParams } from './params';
import { TikTokCrawler } from './crawler/tiktok.crawler';
import { DouYinCrawler } from './crawler/douyin.crawler';
import { AwemeData as DouyinAwemeData, Images } from './interfaces/douyin/douyin.interface';
import { XCrawler } from './crawler/x.crawler';
// import { BilibiliCrawler } from './crawler/bilibili.crawler';

/**Supported platform */
enum Platform {
    douyin = 'douyin',
    bilibili = 'bilibili',
    kuaishou = 'kuaishou',
    tiktok = 'tiktok',
    xigua = 'xigua',
    x = 'x',
}

@Injectable()
export class ApiService {
    // private readonly tiktok: TikTokCrawler; // tiktok爬取封装
    // private readonly douyin: DouYinCrawler; // douyin爬取封装
    // private readonly bilibili: BilibiliCrawler; // bilibili爬取封装

    constructor(
        private readonly http: HttpService,
        private readonly logger: Logger,
        private readonly tiktok: TikTokCrawler,
        private readonly douyin: DouYinCrawler,
        private readonly x: XCrawler
    ) {}

    #headers: object = {
        'User-Agent': UserAgent,
    };

    #douyinHeaders: object = {
        'accept-encoding': 'gzip, deflate, br',
        'User-Agent': UserAgent,
        Referer: 'https://www.douyin.com/',
        // 如果抖音接口不返回数据，可能是因为cookie过期，需要更新cookie/If the Douyin interface does not return data, it may be because the cookie has expired and needs to be updated
        cookie: DouYinCookies,
    };
    #tiktokHeaders: object = {
        'User-Agent':
            'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36',
    };

    #bilibiliHeaders: object = {
        'User-Agent':
            'com.ss.android.ugc.trill/494+Mozilla/5.0+(Linux;+Android+12;+2112123G+Build/SKQ1.211006.001;+wv)+AppleWebKit/537.36+(KHTML,+like+Gecko)+Version/4.0+Chrome/107.0.5304.105+Mobile+Safari/537.36',
    };
    #ixiguaHeaders: object = {
        authority: 'ib.365yg.com',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-language': 'zh-CN,zh;q=0.9',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'sec-ch-ua':
            '"Chromium";v="116", "Not)A;Brand";v="24", "Google Chrome";v="116"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
        'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
    };

    #awemeTypeMap = {
        // 抖音/Douyin
        2: 'image',
        4: 'video',
        68: 'image',
        // TikTok
        0: 'video',
        51: 'video',
        55: 'video',
        58: 'video',
        61: 'video',
        150: 'image',
    };

    #awemeType = {
        [Platform.douyin]: {
            0: 'image',
            2: 'image',
            4: 'video',
            68: 'image',
        },
        [Platform.tiktok]: {
            0: 'video',
            51: 'video',
            55: 'video',
            58: 'video',
            61: 'video',
            150: 'image',
        },
    };

    /**
     * Asynchronously parses a URL and returns an object containing data about the media.
     *
     * @param {string} url - The URL to parse.
     * @return {Promise<object>} A promise that resolves to an object containing data about the media.
     * @throws {Error} If the platform is unsupported or if getting the media ID or video data fails.
     */
    async hybridParsing(url: string): Promise<object> {
        const platform: Platform = this.judgePlatform(url);
        if (!platform) {
            throw new HttpException(
                'Unsupported platform',
                HttpStatus.BAD_REQUEST
            );
        }
        this.logger.log(`Start to parse ${platform} url: ${url}`);
        const awemeID = await this.getAwemeID(url, platform);
        if (!awemeID) {
            throw new HttpException(
                `Get ${platform} media id Failed`,
                HttpStatus.BAD_REQUEST
            );
        }
        const awemeData = await this.getAwemeData(awemeID, platform, url);
        if (!awemeData) {
            throw new HttpException(
                `Get ${platform} video data Failed`,
                HttpStatus.BAD_REQUEST
            );
        }
        switch (platform) {
            case Platform.bilibili:
                return awemeData;
            case Platform.xigua:
                return awemeData;
            case Platform.kuaishou:
                return awemeData;
            case Platform.tiktok:
                this.logger.log('Start to format TikTok data...');
                return this.tiktok.formatData(awemeData);
            case Platform.x:
                return this.x.formatData(awemeData);
        }
        this.logger.log(
            `Get ${platform} video data success, judge media type...`
        );
        // 通过媒体时长来判断类型，duration为0表示图片
        const awemeType = awemeData['duration'] ? 'video' : 'image';
        this.logger.log(`Get ${platform} video type: ${awemeType}`);
        this.logger.log(`Start to format data...`);
        let officialUrl = this.getOfficialAPIUrl(platform, awemeID);
        let result = {
            status: 'success',
            message: '',
            type: awemeType,
            platform: platform,
            aweme_id: awemeID,
            official_api_url: officialUrl,
            desc: awemeData['desc'],
            create_time: awemeData['create_time'],
            author: awemeData['author'],
            music: awemeData['music'],
            statistics: awemeData['statistics'],
            cover_data: {
                cover: awemeData['video']['cover'],
                origin_cover: awemeData['video']['origin_cover'],
                dynamic_cover: awemeData['video']['dynamic_cover'],
            },
            hashtags: awemeData['text_extra'],
            video_data: {},
            image_data: {},
        };

        let apiData: object = {};
        // Platform switch, support douyin, tiktok
        switch (platform) {
            case Platform.douyin:
                switch (awemeType) {
                    // Generate douyin video data
                    case 'video':
                        this.logger.log('Start to format douyin video data');
                        let uri = awemeData['video']['play_addr']['uri'];
                        let wm_video_url =
                            awemeData['video']['play_addr']['url_list'][0];
                        let wm_video_url_HQ = `https://aweme.snssdk.com/aweme/v1/playwm/?video_id=${uri}&radio=1080p&line=0`;
                        let nwm_video_url = wm_video_url.replace(
                            'playwm',
                            'play'
                        );
                        let nwm_video_url_HQ = `https://aweme.snssdk.com/aweme/v1/play/?video_id=${uri}&ratio=1080p&line=0`;
                        apiData = {
                            video_data: {
                                wm_video_url: wm_video_url,
                                wm_video_url_list: [wm_video_url],
                                wm_video_url_HQ: wm_video_url_HQ,
                                wm_video_url_HQ_list: [wm_video_url_HQ],
                                nwm_video_url: nwm_video_url,
                                nwm_video_url_list: [nwm_video_url],
                                nwm_video_url_HQ: nwm_video_url_HQ,
                                nwm_video_url_HQ_list: [nwm_video_url_HQ],
                            },
                        };
                        break;
                    // Generate douyin image data
                    case 'image':
                        this.logger.log('Start to format douyin image data');
                        // 无水印图片列表/No watermark image list
                        let noWatermarkImageList: string[] = [];
                        // 有水印图片列表/With watermark image list
                        let watermarkImageList: string[] = [];
                        const imageList: Images[] = awemeData?.images;
                        // 遍历图片列表/Traverse image list
                        if (imageList && imageList.length > 0) {
                            for (const i of imageList) {
                                noWatermarkImageList.push(i['url_list'][0]);
                                watermarkImageList.push(
                                    i['download_url_list'][0]
                                );
                            }
                        }
                        apiData = {
                            image_data: {
                                no_watermark_image_list: noWatermarkImageList,
                                watermark_image_list: watermarkImageList,
                            },
                        };
                        break;
                }
                break;
        }
        Object.assign(result, apiData);
        return result;
    }

    getOfficialAPIUrl(platform: string, awemeID: string): any {
        switch (platform) {
            case Platform.douyin:
                return {
                    'User-Agent': this.#douyinHeaders['User-Agent'],
                    api_url: `https://www.iesdouyin.com/aweme/v1/web/aweme/detail/?aweme_id=${awemeID}&aid=1128&version_name=23.5.0&device_platform=android&os_version=2333&Github=Evil0ctal&words=FXXK_U_ByteDance`,
                };
            case Platform.tiktok:
                return this.tiktok.getOfficialAPIUrl(awemeID);
        }
    }

    /**
     * Judge platform info from url
     * included: 'douyin', 'bilibili', 'kuaishou', 'tiktok', 'xigua'
     * @param {string} url User raw input url
     * @returns {string}
     */
    judgePlatform(url: string): Platform {
        let platform: Platform;
        if (url.includes(Platform.douyin)) {
            platform = Platform.douyin;
        } else if (url.includes(Platform.bilibili)) {
            platform = Platform.bilibili;
        } else if (url.includes(Platform.kuaishou)) {
            platform = Platform.kuaishou;
        } else if (url.includes(Platform.tiktok)) {
            platform = Platform.tiktok;
        } else if (url.includes(Platform.xigua)) {
            platform = Platform.xigua;
        } else if (url.includes('x.com') || url.includes('twitter.com')) {
            platform = Platform.x;
        }
        return platform;
    }

    async getAwemeData(mediaID: string, platform: string, url: string): Promise<any> {
        switch (platform) {
            case Platform.douyin:
                // return await this.getDouYinAwemeData(mediaID);
                return await this.douyin.getAwemeData(mediaID, url);
            case Platform.tiktok:
                return await this.tiktok.getAwemeData(mediaID, url);
            case Platform.x:
                return await this.x.getAwemeData(mediaID, url);
        }
        return null;
    }

    /**
     * Retrieves DouYin video data based on the provided awemeID.
     *
     * @param {string} awemeID - The unique identifier for the DouYin video.
     * @return {Promise<object | null>} The data object containing the details of the aweme.
     */
    async getDouYinAwemeData(awemeID: string): Promise<DouyinAwemeData | null> {
        const domain: string = 'https://www.douyin.com';
        const endpoint: string = '/aweme/v1/web/aweme/detail/';
        let queryParams = await getDouyinDetailParams('old', awemeID);
        if (!queryParams) {
            return null;
        }
        queryParams['aweme_id'] = awemeID;

        const queryString: string = genParams(queryParams);
        let withParams: string = domain + endpoint + '?' + queryString;
        const xb = generateXBogus(
            queryString,
            this.#douyinHeaders['User-Agent']
        );
        // const xb = new XBogus(this.#headers['User-Agent']).sign(queryString)[1];
        let targetUrl: string = withParams + `&X-Bogus=${xb}`;
        this.logger.log(`Start to query url: ${targetUrl}`);
        const requestConfig: AxiosRequestConfig = {
            headers: this.#douyinHeaders,
        };
        let data = await lastValueFrom(
            this.http.get(targetUrl, requestConfig).pipe(map((res) => res.data))
        );
        return data['aweme_detail'];
    }

    /**
     * Get MediaID by url
     * @param text User raw input url
     * @param platform Url platform
     * @returns mediaID
     */
    async getAwemeID(text: string, platform: Platform): Promise<string | null> {
        switch (platform) {
            case Platform.douyin:
                return await this.getDouYinAwemeID(text);
            // case Platform.bilibili:
            //   return this.getBilibiliMediaID(text);
            // case Platform.kuaishou:
            //   return this.getKuaishouMediaID(text);
            case Platform.tiktok:
                return await this.tiktok.getAwemeID(text);
            // case Platform.xigua:
            //   return this.getXiguaMediaID(text);
            case Platform.x:
                return await this.x.getAwemeID(text)
        }
        return null;
    }
    // getXiguaMediaID(text: string): string {
    //   throw new Error('Method not implemented.');
    // }
    // getTiktokMediaID(text: string): string {
    //   throw new Error('Method not implemented.');
    // }
    // getKuaishouMediaID(text: string): string {
    //   throw new Error('Method not implemented.');
    // }
    // getBilibiliMediaID(text: string): string {
    //   throw new Error('Method not implemented.');
    // }

    /**
     * Get douyin media id from url
     * @param text User raw input url
     * @returns mediaID
     */
    async getDouYinAwemeID(text: string): Promise<string> {
        /**Get douyin media id from url*/
        let url = await this.convertShareUrl(text);
        let mediaID: string;
        let match: object | null = null;
        if (url.includes('/video/')) {
            match = url.match(/\/video\/(\d+)/i);
        } else if (url.includes('discover?')) {
            match = url.match(/modal_id=(\d+)/i);
        } else if (url.includes('live.douyin')) {
            url = url.split('?')[0];
            match = [null, url.replace('https://live.douyin.com/', '')];
        } else if (url.includes('note')) {
            match = url.match(/\/note\/(\d+)/i);
        }
        mediaID = match ? match[1] : ''
        this.logger.log(`Get media id: ${mediaID}`);
        return mediaID;
    }

    async convertShareUrl(text: string): Promise<string> {
        let url: string = findUrl(text);
        if (!url) {
            throw new HttpException('Invalid url', HttpStatus.BAD_REQUEST);
        }
        if (url.includes(Platform.douyin)) {
            /**Get douyin original url, except receive 302 response, get url from header */
            if (url.includes('v.douyin')) {
                url = url.match(/(https:\/\/v.douyin.com\/)\w+/i)[0];
                this.logger.log(
                    `Get orginal url by ${Platform.douyin} share url...`
                );
                await firstValueFrom(
                    this.http.get(url, {
                        headers: this.#headers,
                        maxRedirects: 0,
                    })
                ).catch((err) => {
                    if (err.response.status === 302) {
                        url = err.response.headers.location.split('?')[0];
                    }
                    this.logger.log(`Get original url success: ${url}`);
                });
            } else {
                this.logger.log(`No need to convert: ${url}`);
                return url;
            }
        }
        this.logger.log('return url ' + url);
        return url;
    }

    /**
     * Asynchronously retrieves the TikTok media ID from a given URL.
     *
     * @param {string} text - The URL to extract the media ID from.
     * @return {Promise<string>} A Promise that resolves to the TikTok media ID.
     */
    async getTikTokAwemeID(text: string): Promise<string> {
        let url = await this.convertShareUrl(text);
        let awemeID: string = '';
        if (url.includes('/video/')) {
            awemeID = url.match(/\/video\/(\d+)/i)[1];
        } else if (url.includes('/v/')) {
            awemeID = url.match(/\/v\/(\d+)/i)[1];
        }
        return awemeID;
    }

    getMinimalData(data: object): object {
        if (data['status'] != 'success') {
            return data;
        }
        return {
            status: 'success',
            message: data['message'],
            platform: data['platform'],
            type: data['type'],
            desc: data['desc'],
            aweme_id: data['aweme_id'],
            nickname: data['author']['nickname'],
            wm_video_url:
                data['type'] === 'video' || data['type'] === 'hybrid'
                    ? data['video_data']['wm_video_url']
                    : null,
            wm_video_url_HQ:
                data['type'] === 'video' || data['type'] === 'hybrid'
                    ? data['video_data']['wm_video_url_HQ']
                    : null,
            nwm_video_url:
                data['type'] === 'video' || data['type'] === 'hybrid'
                    ? data['video_data']['nwm_video_url']
                    : null,
            nwm_video_url_HQ:
                data['type'] === 'video' || data['type'] === 'hybrid'
                    ? data['video_data']['nwm_video_url_HQ']
                    : null,
            no_watermark_image_list:
                data['type'] === 'image' || data['type'] === 'hybrid'
                    ? data['image_data']['no_watermark_image_list']
                    : null,
            watermark_image_list:
                data['type'] === 'image' || data['type'] === 'hybrid'
                    ? data['image_data']['watermark_image_list']
                    : null,
            wm_video_url_list: data['video_data']['wm_video_url_list'],
            wm_video_url_HQ_list: data['video_data']['wm_video_url_HQ_list'],
            nwm_video_url_list: data['video_data']['nwm_video_url_list'],
            nwm_video_url_HQ_list: data['video_data']['nwm_video_url_HQ_list'],
        };
    }
}
