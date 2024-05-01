import { HttpService } from '@nestjs/axios';
export declare class ApiService {
    #private;
    private readonly http;
    constructor(http: HttpService);
    hybridParsing(url: string): Promise<object>;
    getOfficialAPIUrl(platform: string, awemeID: string): any;
    judgePlatform(url: string): string;
    getAwemeData(mediaID: string, platform: string): Promise<any>;
    getDouYinAwemeData(awemeID: string): Promise<any>;
    getAwemeID(text: string, platform: string): Promise<string>;
    getDouYinAwemeID(text: string): Promise<string>;
    convertShareUrl(text: string): Promise<string>;
    getTikTokAwemeID(text: string): Promise<string>;
    getTikTokAwemeData(awemeID: string): Promise<object>;
    getMinimalData(data: object): object;
}
