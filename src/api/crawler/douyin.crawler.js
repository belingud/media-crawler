"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DouYinCrawler = void 0;
const config_1 = require("../../config");
const base_crawler_1 = require("./base.crawler");
const X_Bogus_1 = require("../../pkg/X-Bogus");
const params_1 = require("../params");
const util_1 = require("../../pkg/util");
const rxjs_1 = require("rxjs");
class DouYinCrawler extends base_crawler_1.BaseCrawler {
    #douyinHeaders = {
        'accept-encoding': 'gzip, deflate, br',
        'User-Agent': config_1.UserAgent,
        Referer: 'https://www.douyin.com/',
        cookie: config_1.DouYinCookies,
    };
    async getAwemeID(text) {
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
    async getAwemeData(awemeID) {
        const domain = 'https://www.douyin.com';
        const endpoint = '/aweme/v1/web/aweme/detail/';
        let queryParams = await (0, params_1.getDouyinDetailParams)('old', awemeID);
        queryParams['aweme_id'] = awemeID;
        const queryString = (0, util_1.genParams)(queryParams);
        let withParams = domain + endpoint + '?' + queryString;
        const xb = this.genXBogus(queryString);
        let targetUrl = withParams + `&X-Bogus=${xb}/`;
        console.log(`Start to query url: ${targetUrl}`);
        const requestConfig = {
            headers: this.#douyinHeaders,
        };
        let data = await (0, rxjs_1.lastValueFrom)(this.http.get(targetUrl, requestConfig).pipe((0, rxjs_1.map)((res) => res.data)));
        console.log(data);
        return data['aweme_detail'];
    }
    getOfficialAPIUrl(awemeID) {
        return {
            'User-Agent': this.#douyinHeaders['User-Agent'],
            api_url: `https://www.iesdouyin.com/aweme/v1/web/aweme/detail/?aweme_id=${awemeID}&aid=1128&version_name=23.5.0&device_platform=android&os_version=2333&Github=Evil0ctal&words=FXXK_U_ByteDance`,
        };
    }
    genXBogus(query) {
        return (0, X_Bogus_1.sign)(query, this.#douyinHeaders['User-Agent']);
    }
}
exports.DouYinCrawler = DouYinCrawler;
//# sourceMappingURL=douyin.crawler.js.map