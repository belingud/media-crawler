import { HttpService } from '@nestjs/axios';
export declare class BaseCrawler {
    #private;
    protected readonly http: HttpService;
    constructor(http: HttpService);
    convertShareUrl(text: string): Promise<string>;
}
