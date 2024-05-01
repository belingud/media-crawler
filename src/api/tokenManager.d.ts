export declare function getTimeStamp(unit?: string): number;
export declare class TokenManager {
    static tokenConf: {
        magic: string;
        version: number;
        dataType: number;
        strData: string;
        'User-Agent': string;
        url: string;
    };
    genRealTimeMSToken(): Promise<string>;
    private parseMsToken;
    genFakeMsToken(): string;
    genRandomStr(randomLength: number): string;
}
export declare function genMSToken(): Promise<string>;
