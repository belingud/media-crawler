import { DouYinCookies, UserAgent } from '../../api.config';
import { BaseCrawler } from './base.crawler';
import { sign } from '../../common/X-Bogus';
import { getDouyinDetailParams } from '../params';
import { genParams } from '../../common/util';
import { AxiosRequestConfig } from 'axios';
import { lastValueFrom, map } from 'rxjs';
import { PlaywrightService } from 'src/playwright/playwright.service';
import * as playwright from 'playwright';

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
    async getAwemeData(awemeID: string, url: string): Promise<any> {
        const awemePageUrl: string = `https://www.douyin.com/video/${awemeID}?previous_page=web_code_link`;
        const context = await playwright.chromium.launchPersistentContext('./user-data', {
            channel: 'msedge',
            headless: true,
            args: ['--disable-blink-features=AutomationControlled'],
            extraHTTPHeaders: {
                'sec-ch-ua':
                    '"Microsoft Edge";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
            },
            ...playwright.devices['Desktop Edge'],
        })
        const page = await context.newPage();
        await page.setViewportSize({ width: 1280, height: 800 });
        let result: any;
        const waitForResponse = new Promise<void>((resolve) => {
            page.on('response', async (response) => {
              const url = response.url();
              if (url.includes('douyin.com/aweme/v1/web/aweme/detail')) {
                // console.log(`Request URL: ${url}`);
                console.log('request aweme detail')
                const responseBody = await response.json();
                result = responseBody;
                resolve(); // 请求完成，结束等待
              }
            });
          });
        await page.goto(awemePageUrl);
        // 添加延迟和模拟用户行为
        await page.waitForTimeout(5000); // 等待5秒
        await page.mouse.move(100, 100);
        await page.waitForTimeout(2000); // 再次等待2秒
        await page.mouse.move(200, 200);
        // 在页面中执行一些操作，比如滚动
        await page.evaluate(() => window.scrollBy(0, 100));
        await waitForResponse;
        // 关闭浏览器
        await context.close();
        return result['aweme_detail'];
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
