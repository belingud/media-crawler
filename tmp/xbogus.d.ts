export declare class XBogus {
    private array;
    private charactor;
    private usKey;
    private userAgent;
    params: string;
    xb: string;
    constructor(user_agent?: string);
    sign(urlPath: string): string[];
    private rc4Encrypt;
    private md5;
    private md5StrToArray;
    private md5Encrypt;
    encodingConversion(a: number, b: number, c: number, e: number, d: number, t: number, f: number, r: number, n: number, o: number, i: number, _: number, x: number, u: number, s: number, l: number, v: number, h: number, p: number): string;
    private encodingConversion2;
    private calculation;
}
