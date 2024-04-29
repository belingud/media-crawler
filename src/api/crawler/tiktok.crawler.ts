import { BaseCrawler } from './base.crawler';

export class TikTokCrawler extends BaseCrawler {
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
}
