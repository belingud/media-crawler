"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TikTokCrawler = void 0;
const base_crawler_1 = require("./base.crawler");
class TikTokCrawler extends base_crawler_1.BaseCrawler {
    #tiktokHeaders = {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36',
    };
    getOfficialAPIUrl(awemeID) {
        return {
            'User-Agent': this.#tiktokHeaders['User-Agent'],
            api_url: `https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?aweme_id=${awemeID}`,
        };
    }
}
exports.TikTokCrawler = TikTokCrawler;
//# sourceMappingURL=tiktok.crawler.js.map