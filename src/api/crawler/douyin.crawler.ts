import { DouYinCookies, UserAgent } from '../../api.config';
import { BaseCrawler } from './base.crawler';
import { sign } from '../../pkg/X-Bogus';
import { getDouyinDetailParams } from '../params';
import { genParams } from '../../pkg/util';
import { AxiosRequestConfig } from 'axios';
import { lastValueFrom, map } from 'rxjs';

export class DouYinCrawler extends BaseCrawler {
    #douyinHeaders: object = {
        'accept-encoding': 'gzip, deflate, br',
        'User-Agent': UserAgent,
        Referer: 'https://www.douyin.com/',
        // 如果抖音接口不返回数据，可能是因为cookie过期，需要更新cookie/If the Douyin interface does not return data, it may be because the cookie has expired and needs to be updated
        cookie: DouYinCookies,
    };

    //   constructor(private readonly http: HttpService) {
    //     super();
    //   }

    /**
     * Get douyin media id from url
     * @param text User raw input url
     * @returns mediaID
     */
    async getAwemeID(text: string): Promise<string> {
        /**Get douyin media id from url*/
        let url = await this.convertShareUrl(text);
        let mediaID: string;
        if (url.includes('/video/')) {
            mediaID = url.match(/\/video\/(\d+)/i)[1];
        } else if (url.includes('discover?')) {
            mediaID = url.match(/modal_id=(\d+)/i)[1];
        } else if (url.includes('live.douyin')) {
            url = url.split('?')[0];
            mediaID = url.replace('https://live.douyin.com/', '');
        } else if (url.includes('note')) {
            mediaID = url.match(/\/note\/(\d+)/i)[1];
        }
        console.log(`Get media id: ${mediaID}`);
        return mediaID;
    }

    /**
     * Retrieves DouYin video data based on the provided awemeID.
     *
     * @param {string} awemeID - The unique identifier for the DouYin video.
     * @return {Promise<any>} The data object containing the details of the aweme.
     */
    async getAwemeData(awemeID: string): Promise<any> {
        const domain: string = 'https://www.douyin.com';
        const endpoint: string = '/aweme/v1/web/aweme/detail/';
        let queryParams = await getDouyinDetailParams('old', awemeID);
        queryParams['aweme_id'] = awemeID;

        const queryString: string = genParams(queryParams);
        let withParams: string = domain + endpoint + '?' + queryString;
        const xb = this.genXBogus(queryString);
        // const xb = new XBogus(this.#headers['User-Agent']).sign(queryString)[1];
        let targetUrl: string = withParams + `&X-Bogus=${xb}/`;
        console.log(`Start to query url: ${targetUrl}`);
        const requestConfig: AxiosRequestConfig = {
            headers: this.#douyinHeaders,
        };
        let data = await lastValueFrom(
            this.http
                .get(targetUrl, requestConfig)
                .pipe(map((res) => res.data)),
        );
        console.log(data);
        return data['aweme_detail'];
    }

    getOfficialAPIUrl(awemeID: string): object {
        return {
            'User-Agent': this.#douyinHeaders['User-Agent'],
            api_url: `https://www.iesdouyin.com/aweme/v1/web/aweme/detail/?aweme_id=${awemeID}&aid=1128&version_name=23.5.0&device_platform=android&os_version=2333&Github=Evil0ctal&words=FXXK_U_ByteDance`,
        };
    }

    genXBogus(query: string): string {
        return sign(query, this.#douyinHeaders['User-Agent']);
    }
}
// const d = new DouYinCrawler(new HttpService());
// d.getAwemeData('7356162779423853824').then((res) => console.log(res));
