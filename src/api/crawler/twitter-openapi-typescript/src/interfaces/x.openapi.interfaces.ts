import { AxiosProxyConfig } from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";

export declare interface XOpenAPIOptions {
    agentUrl?: string;
    proxy?: AxiosProxyConfig,
}

export declare interface CookieType {
    [key: string]: string;
}

export declare interface XRequestInit extends RequestInit {
    agent?: HttpsProxyAgent<string>;
}