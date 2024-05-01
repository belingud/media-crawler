import { BaseCrawler } from './base.crawler';
export declare class DouYinCrawler extends BaseCrawler {
    #private;
    getAwemeID(text: string): Promise<string>;
    getAwemeData(awemeID: string): Promise<any>;
    getOfficialAPIUrl(awemeID: string): object;
    genXBogus(query: string): string;
}
