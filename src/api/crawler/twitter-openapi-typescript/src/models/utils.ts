import { HttpsProxyAgent } from 'https-proxy-agent';
import * as i from 'twitter-openapi-typescript-generated';

export type TRequestInit = RequestInit & {
    agent?: HttpsProxyAgent<string>;
};

export type initOverrides = TRequestInit | i.InitOverrideFunction;
export type ApiFunction<T> = (
    requestParameters: any,
    initOverrides?: initOverrides
) => Promise<i.ApiResponse<T>>;

export type RequestParam<T1, T2> = {
    apiFn: ApiFunction<i.Errors | T2>;
    convertFn: (arg0: T2) => T1;
    key: string;
    param: { [key: string]: any };
};
