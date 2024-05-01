"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiService = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const util_1 = require("../pkg/util");
const config_1 = require("../config");
const params_1 = require("./params");
var Platform;
(function (Platform) {
    Platform["douyin"] = "douyin";
    Platform["bilibili"] = "bilibili";
    Platform["kuaishou"] = "kuaishou";
    Platform["tiktok"] = "tiktok";
    Platform["xigua"] = "xigua";
})(Platform || (Platform = {}));
let ApiService = class ApiService {
    http;
    constructor(http) {
        this.http = http;
    }
    #headers = {
        'User-Agent': config_1.UserAgent,
    };
    #douyinHeaders = {
        'accept-encoding': 'gzip, deflate, br',
        'User-Agent': config_1.UserAgent,
        Referer: 'https://www.douyin.com/',
        cookie: config_1.DouYinCookies,
    };
    #tiktokHeaders = {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36',
    };
    #bilibiliHeaders = {
        'User-Agent': 'com.ss.android.ugc.trill/494+Mozilla/5.0+(Linux;+Android+12;+2112123G+Build/SKQ1.211006.001;+wv)+AppleWebKit/537.36+(KHTML,+like+Gecko)+Version/4.0+Chrome/107.0.5304.105+Mobile+Safari/537.36',
    };
    #ixiguaHeaders = {
        authority: 'ib.365yg.com',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-language': 'zh-CN,zh;q=0.9',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'sec-ch-ua': '"Chromium";v="116", "Not)A;Brand";v="24", "Google Chrome";v="116"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
    };
    #awemeTypeMap = {
        2: 'image',
        4: 'video',
        68: 'image',
        0: 'video',
        51: 'video',
        55: 'video',
        58: 'video',
        61: 'video',
        150: 'image',
    };
    async hybridParsing(url) {
        const platform = this.judgePlatform(url);
        if (!platform) {
            throw new Error('Unsupported platform');
        }
        console.log(`Start to parse ${platform} url: ${url}`);
        const awemeID = await this.getAwemeID(url, platform);
        if (!awemeID) {
            throw new Error(`Get ${platform} media id Failed`);
        }
        const awemeData = await this.getAwemeData(awemeID, platform);
        if (!awemeData) {
            throw new Error(`Get ${platform} video data Failed`);
        }
        switch (platform) {
            case Platform.bilibili:
                return awemeData;
            case Platform.xigua:
                return awemeData;
            case Platform.kuaishou:
                return awemeData;
        }
        console.log(`Get ${platform} video data success, judge media type...`);
        const awemeTypeCode = awemeData['aweme_type'];
        const awemeType = this.#awemeTypeMap[awemeTypeCode];
        console.log(`Get ${platform} video type: ${awemeType}`);
        console.log(`Start to format data...`);
        let result = {
            status: 'success',
            message: '',
            type: awemeType,
            platform: platform,
            aweme_id: awemeID,
            official_api_url: this.getOfficialAPIUrl(platform, awemeID),
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
        };
        let apiData = {};
        switch (platform) {
            case Platform.douyin:
                switch (awemeType) {
                    case 'video':
                        console.log('Start to format douyin video data');
                        let uri = awemeData['video']['play_addr']['uri'];
                        let wm_video_url = awemeData['video']['play_addr']['url_list'][0];
                        let wm_video_url_HQ = `https://aweme.snssdk.com/aweme/v1/playwm/?video_id=${uri}&radio=1080p&line=0`;
                        let nwm_video_url = wm_video_url.replace('playwm', 'play');
                        let nwm_video_url_HQ = `https://aweme.snssdk.com/aweme/v1/play/?video_id=${uri}&ratio=1080p&line=0`;
                        apiData = {
                            video_data: {
                                wm_video_url: wm_video_url,
                                wm_video_url_HQ: wm_video_url_HQ,
                                nwm_video_url: nwm_video_url,
                                nwm_video_url_HQ: nwm_video_url_HQ,
                            },
                        };
                        break;
                    case 'image':
                        console.log('Start to format douyin image data');
                        let noWatermarkImageList = [];
                        let watermarkImageList = [];
                        const imageList = awemeData?.image_list;
                        if (imageList && imageList.length > 0) {
                            for (const i of imageList) {
                                noWatermarkImageList.push(i['url_list'][0]);
                                watermarkImageList.push(i['download_url_list'][0]);
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
            case Platform.tiktok:
                switch (awemeType) {
                    case 'video':
                        console.log('Start to format tiktok video data');
                        const wmVideo = awemeData['video']['download_addr']['url_list'][0];
                        apiData = {
                            video_data: {
                                wm_video_url: wmVideo,
                                wm_video_url_HQ: wmVideo,
                                nwm_video_url: awemeData['video']['play_addr']['url_list'][0],
                                nwm_video_url_HQ: awemeData['video']['bit_rate'][0]['play_addr']['url_list'][0],
                            },
                        };
                        break;
                    case 'image':
                        console.log('Start to format tiktok image data');
                        let noWatermarkImageList = [];
                        let watermarkImageList = [];
                        const imagePostInfo = awemeData?.image_post_info;
                        const images = imagePostInfo?.images;
                        if (images) {
                            for (const i of awemeData['image_post_info']['images']) {
                                noWatermarkImageList.push(i['display_image']['url_list'][0]);
                                watermarkImageList.push(i['owner_watermark_image']['url_list'][0]);
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
        }
        Object.assign(result, apiData);
        return result;
    }
    getOfficialAPIUrl(platform, awemeID) {
        switch (platform) {
            case Platform.douyin:
                return {
                    'User-Agent': this.#douyinHeaders['User-Agent'],
                    api_url: `https://www.iesdouyin.com/aweme/v1/web/aweme/detail/?aweme_id=${awemeID}&aid=1128&version_name=23.5.0&device_platform=android&os_version=2333&Github=Evil0ctal&words=FXXK_U_ByteDance`,
                };
            case Platform.tiktok:
                return {
                    'User-Agent': this.#tiktokHeaders['User-Agent'],
                    api_url: `https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?aweme_id=${awemeID}`,
                };
        }
    }
    judgePlatform(url) {
        let platform;
        if (url.includes(Platform.douyin)) {
            platform = Platform.douyin;
        }
        else if (url.includes(Platform.bilibili)) {
            platform = Platform.bilibili;
        }
        else if (url.includes(Platform.kuaishou)) {
            platform = Platform.kuaishou;
        }
        else if (url.includes(Platform.tiktok)) {
            platform = Platform.tiktok;
        }
        else if (url.includes(Platform.xigua)) {
            platform = Platform.xigua;
        }
        return platform;
    }
    async getAwemeData(mediaID, platform) {
        switch (platform) {
            case Platform.douyin:
                return await this.getDouYinAwemeData(mediaID);
            case Platform.tiktok:
                return await this.getTikTokAwemeData(mediaID);
        }
    }
    async getDouYinAwemeData(awemeID) {
        const domain = 'https://www.douyin.com';
        const endpoint = '/aweme/v1/web/aweme/detail/';
        let queryParams = await (0, params_1.getDouyinDetailParams)('old', awemeID);
        queryParams['aweme_id'] = awemeID;
        const queryString = (0, util_1.genParams)(queryParams);
        let withParams = domain + endpoint + '?' + queryString;
        const xb = (0, util_1.generateXBogus)(queryString, this.#douyinHeaders['User-Agent']);
        let targetUrl = withParams + `&X-Bogus=${xb}`;
        console.log(`Start to query url: ${targetUrl}`);
        const requestConfig = {
            headers: this.#douyinHeaders,
        };
        let data = await (0, rxjs_1.lastValueFrom)(this.http.get(targetUrl, requestConfig).pipe((0, rxjs_1.map)((res) => res.data)));
        return data['aweme_detail'];
    }
    async getAwemeID(text, platform) {
        switch (platform) {
            case Platform.douyin:
                return await this.getDouYinAwemeID(text);
            case Platform.tiktok:
                return await this.getTikTokAwemeID(text);
        }
        return null;
    }
    async getDouYinAwemeID(text) {
        let url = await this.convertShareUrl(text);
        let mediaID;
        if (url.includes('/video/')) {
            mediaID = url.match(/\/video\/(\d+)/i)[1];
        }
        else if (url.includes('discover?')) {
            mediaID = url.match(/modal_id=(\d+)/i)[1];
        }
        else if (url.includes('live.douyin')) {
            url = url.split('?')[0];
            mediaID = url.replace('https://live.douyin.com/', '');
        }
        else if (url.includes('note')) {
            mediaID = url.match(/\/note\/(\d+)/i)[1];
        }
        console.log(`Get media id: ${mediaID}`);
        return mediaID;
    }
    async convertShareUrl(text) {
        let url = (0, util_1.findUrl)(text);
        if (url.includes(Platform.douyin)) {
            if (url.includes('v.douyin')) {
                url = url.match(/(https:\/\/v.douyin.com\/)\w+/i)[0];
                console.log(`Get orginal url by ${Platform.douyin} share url...`);
                await (0, rxjs_1.firstValueFrom)(this.http.get(url, {
                    headers: this.#headers,
                    maxRedirects: 0,
                })).catch((err) => {
                    if (err.response.status === 302) {
                        url = err.response.headers.location.split('?')[0];
                    }
                    console.log(`Get original url success: ${url}`);
                });
            }
            else {
                console.log(`No need to convert: ${url}`);
                return url;
            }
        }
        console.log('return url ' + url);
        return url;
    }
    async getTikTokAwemeID(text) {
        let url = await this.convertShareUrl(text);
        let awemeID;
        if (url.includes('/video/')) {
            awemeID = url.match(/\/video\/(\d+)/i)[1];
        }
        else if (url.includes('/v/')) {
            awemeID = url.match(/\/v\/(\d+)/i)[1];
        }
        return awemeID;
    }
    async getTikTokAwemeData(awemeID) {
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
        const axiosConfig = {
            params: queryParams,
        };
        let data = await (0, rxjs_1.lastValueFrom)(this.http.get(config_1.TikTokApiUrl, axiosConfig).pipe((0, rxjs_1.map)((res) => res.data))).catch((error) => {
            console.log(error);
            throw new common_1.NotFoundException('Media not found');
        });
        const awemeData = data['aweme_list'][0];
        if (awemeID != awemeData['aweme_id']) {
            throw new common_1.NotFoundException('Media not found');
        }
        return data;
    }
    getMinimalData(data) {
        if (data['status'] != 'success') {
            return data;
        }
        return {
            status: 'success',
            message: data['message'],
            platform: data['platform'],
            type: data['type'],
            desc: data['desc'],
            wm_video_url: data['type'] === 'video' ? data['video_data']['wm_video_url'] : null,
            wm_video_url_HQ: data['type'] === 'video' ? data['video_data']['wm_video_url_HQ'] : null,
            nwm_video_url: data['type'] === 'video' ? data['video_data']['nwm_video_url'] : null,
            nwm_video_url_HQ: data['type'] === 'video'
                ? data['video_data']['nwm_video_url_HQ']
                : null,
            no_watermark_image_list: data['type'] === 'image'
                ? data['image_data']['no_watermark_image_list']
                : null,
            watermark_image_list: data['type'] === 'image'
                ? data['image_data']['watermark_image_list']
                : null,
        };
    }
};
exports.ApiService = ApiService;
exports.ApiService = ApiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], ApiService);
//# sourceMappingURL=api.service.js.map