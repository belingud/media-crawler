import { AxiosProxyConfig, AxiosRequestConfig, AxiosResponse } from 'axios';
import { BaseCrawler } from './base.crawler';
import { firstValueFrom, lastValueFrom, map } from 'rxjs';
import { TikTokApiUrl, TikTokCookie, UserAgent } from '../../api.config';
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
        protected readonly config: ConfigService
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
        let awemeID: string;
        if (url.includes('/video/')) {
            awemeID = url.match(/\/video\/(\d+)/i)[1];
        } else if (url.includes('/v/')) {
            awemeID = url.match(/\/v\/(\d+)/i)[1];
        }
        return awemeID;
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
        let preRequest: any = await firstValueFrom(
            this.http.get('https://www.tiktok.com/', {
                proxy: this.config.get<AxiosProxyConfig>(
                    'DEFAULT_PROXY_CONFIG'
                ),
                headers: { 'User-Agent': UserAgent },
            })
        ).catch((error) => {
            logger.error(error);
        });
        let headers: object = preRequest.headers || { 'set-cookie': [] };
        let cookies: string = headers['set-cookie'].join('; ');
        cookies = cookies.trim();
        let _headers = Object.assign({ Cookie: cookies }, this.#tiktokHeaders);
        const axiosConfig: AxiosRequestConfig = {
            headers: _headers,
            proxy: this.config.get<AxiosProxyConfig>('DEFAULT_PROXY_CONFIG'),
        };
        const detailUrl = `${url}`;
        console.debug('detailUrl : ', detailUrl);
        let data = await lastValueFrom(
            this.http.get(detailUrl, axiosConfig).pipe(map((res) => res.data))
        ).catch((error) => {
            logger.log(error);
            throw new NotFoundException('Media not found');
        });
        if (!data) {
            throw new NotFoundException('Media not found');
        }
        const match: RegExpMatchArray = this.#videoInfoPattern.exec(data);
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
                wm_video_url_HQ: video['downloadAddr'],
                nwm_video_url: video['playAddr'],
                nwm_video_url_HQ: video['playAddr'],
            },
        };
        return data;
    }
}
// headers:{'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8', 'Accept-Language': 'en-us,en;q=0.5', 'Sec-Fetch-Mode': 'navigate', 'Accept-Encoding': 'gzip, deflate, br'}
// download headers: {'Accept-Encoding': 'identity', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36', 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8', 'Accept-Language': 'en-us,en;q=0.5', 'Sec-Fetch-Mode': 'navigate', 'Referer': 'https://www.tiktok.com/@aze.sg/video/7346559915361635586'}
// video httpie:

// https GET https://v16-webapp-prime.us.tiktok.com/video/tos/alisg/tos-alisg-pve-0037c001/owlfQ0sEADEHvgUPOOFBfFZvjBQOpI8SRD9Isg/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=unwatermarked&cd=0%7C0%7C0%7C&cv=1&br=1692&bt=846&cs=0&ds=6&ft=4KJMyMzm8Zmo0SNcq-4jVJAZdpWrKsd.&mime_type=video_mp4&qs=0&rc=ZDs8Njk6aDM4NWVmZGZpNkBpanBrcXE5cnQ2cTMzODczNEBgYjRfLS5eXzMxL2FeXmMwYSMwY2RoMmRjZW5gLS1kMS1zcw%3D%3D&btag=e00090000&expire=1716648270&l=2024052508431608FEA8992E299C17CF47&ply_type=2&policy=2&signature=dd0aa2e3970d66ff74c40f70b3f10fbf&tk=tt_chain_token \
// 'Host:v16-webapp-prime.us.tiktok.com' \
// 'Connection:keep-alive' \
// 'sec-ch-ua:"Microsoft Edge";v="123", "Not:A-Brand";v="8", "Chromium";v="123"' \
// 'DNT:1' \
// 'Accept-Encoding:identity;q=1, *;q=0' \
// 'sec-ch-ua-mobile:?0' \
// 'User-Agent:Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0' \
// 'sec-ch-ua-platform:"macOS"' \
// 'Accept:*/*' \
// 'Sec-Fetch-Site:same-site' \
// 'Sec-Fetch-Mode:no-cors' \
// 'Sec-Fetch-Dest:video' \
// 'Referer:https://www.tiktok.com/' \
// 'Accept-Language:zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6' \
// 'Cookie:tt_csrf_token=ggvXO3hm-1QXfUGuWhec5X8VA01LhR89e-EE; tt_chain_token=3khp3OaAmUxpy8qf9BA41Q==; odin_tt=cfcfed4a017dce8904d75a0cba87b505f675726c89deab21441e790efdd42ca58f4b2bef8a3acb1a908bc75505dee4027782e2bb4c78cf8f7c319fe17b8f530ed4e72c33c0542eca003e76387c0d33a8; passport_csrf_token=34d9d023fe593a91d280b378e31394fa; passport_csrf_token_default=34d9d023fe593a91d280b378e31394fa; s_v_web_id=verify_lwj9uddx_8l0jUjjo_6R8o_4qr7_BPiE_DFPz6NnxJnQK; d_ticket=e6c722d81fa24225d8adbae3b68c9d74f21e8; multi_sids=7337269478160892974%3Af21001836c202ed54bb5654bd5d8c460; cmpl_token=AgQQAPNSF-RO0rXt2RDLKl0X_C7ZdUnWv5I3YNcdow; uid_tt=ff0ed33dadccd17b78cbdbdc73985037d8bd8befe459a2ca9b79cb7b297e4e4d; uid_tt_ss=ff0ed33dadccd17b78cbdbdc73985037d8bd8befe459a2ca9b79cb7b297e4e4d; sid_tt=f21001836c202ed54bb5654bd5d8c460; sessionid=f21001836c202ed54bb5654bd5d8c460; sessionid_ss=f21001836c202ed54bb5654bd5d8c460; store-idc=useast5; store-country-code=us; store-country-code-src=uid; tt-target-idc=useast5; tt-target-idc-sign=S5akfMpSurQN7Rn-9aj_JCk-eErtqGBkahFuFq25Cu5N560lCWfAsQRftuoxeSy6y847qCzvpoNXe7VaT-CC51cTBYJAyC73Q2DUA67tD0EOQbe9ZG5vBbAl74KantFex9TVrGJ-sEPVZTkN2S7p6QKCUetQ7wrvIdwXZF3PrQ5wKFghNZNyxp55f89S39041PuJSBlUn2uylux8PM-Ms7bwBKz2C3MLl8S49iMs-3FAwMurTIy8yuHbCZP3cPKnARVvS2PAjJbCRnE6VCQNIt0FaDZF9QI1ryBC1v7vjwnw1E-ylH1EvJGUuDYhpWQQJDgA_4bly5OSUBU2Wbe7Ozf7DuLY3TtsJB9o_GPsPgg5NJ5UJrU_Ag5HF5AIoYgqNZwG4atU6S3dFKydHH0wl66Jcff0d4Vh1NksYmNSvHfYvCvzWhyQpWjgSteirPe2SDJ3CIbs9SZil-FjzNQsV91jRbjOF9gdSLjJGdBRWTeTOa_npI9sIiPNBc5fgcJo; sid_guard=f21001836c202ed54bb5654bd5d8c460%7C1716469913%7C15551992%7CTue%2C+19-Nov-2024+13%3A11%3A45+GMT; sid_ucp_v1=1.0.0-KGY0NGNlODFjYzRhMzk1MDUzMzAzOTY3ZDgxYWMxNjA1ZWYwMTk3NmIKGAiuiOKY9PbN6WUQmYG9sgYYsws4AUDqBxAEGgd1c2Vhc3Q1IiBmMjEwMDE4MzZjMjAyZWQ1NGJiNTY1NGJkNWQ4YzQ2MA; ssid_ucp_v1=1.0.0-KGY0NGNlODFjYzRhMzk1MDUzMzAzOTY3ZDgxYWMxNjA1ZWYwMTk3NmIKGAiuiOKY9PbN6WUQmYG9sgYYsws4AUDqBxAEGgd1c2Vhc3Q1IiBmMjEwMDE4MzZjMjAyZWQ1NGJiNTY1NGJkNWQ4YzQ2MA; ak_bmsc=B1A05A1ED04948B4564BCF3838058750~000000000000000000000000000000~YAAQDPN0aBGl562PAQAAE4/nrhf1YUvZQOgYJYaylFPqSD1heEttvX0a/uzS79PDgz3pERkZDRtLzo2NTyY4v4pQ0CQ06g4bREGM+PPWe/J1bwiH0A7Wb6RpXnJshi4v+tI6EyWJN/rQ82mzbkEjWFYGrQ2hRJwsv6r1bTjZC4qGpRpQvIN3CTaBIk3lb5PEQYAUHu4LC7R7eNFsL9L4Y8JKiTCntSoBtsP9BetfyKTB6jy8cwCHM4C1PJWTsTUzBuZ2Dqg2GYXLMMQx5wU4hpq7ees4dU4MCcHVl/q3FFVOy/aPxdKop7MgsH13UYaufg5lki5EkMEfOelTnhNyzf/2cvlT9bz3fM4Hd9XHwT665t4DUq2yof/54vc=; msToken=AN-lLdatB9aSprp611s3IRUtQ0b086MDrKv7D4kN8NTjmOunaTvfOPu-UwGUMQKa5h7zxc8pnSgx6zjq1deeSX1yHf_prp3CSm7keoqYWrg5K2j2T9Mp7rkJjdA9L5diPLU_tWGOdath; bm_sv=2DBF7C271F444B3B6087923F338580CC~YAAQDfN0aP61yqqPAQAARSLrrhdxGufa6CJ/uOtF/9RBXDte3dwrwHJ3wRbLVMt9Gr1lrrXa0SgZGMROC5t1sKQBGBsX1W5OGqp24/3PTMrKPbj4Kp/tEvmB5aBES/MFYFCF8XJ77NRaBWDmIooRDl4pe4pRxt3Eb79J6TbIu6QgUEqfygHy/4U8dMmIHqRU0NJ8pbT1ArKqYPJwqtt3//4c70VfoJ46p0N5/X6h7XWFPb2lJs3vqJkqrOvVW1n4~1; ttwid=1%7CkjcSfrZRkWUtJwpq1spCK9RhklVqborta_0Jhq0zYsY%7C1716626598%7C9a7b8601c60d1c206c2e5098dc4f4138effd991f7a4f7bddb973fab8fe56e4d0' \
// 'Range:bytes=0-' \
// --verify=no --proxy=http:http://localhost:7890 --proxy=https:http://localhost:7890
