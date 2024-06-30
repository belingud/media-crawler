/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Move ssl secret key and cert to src/secret folder
 * 将ssl的key和cert文件移到项目的src/secret目录下
 */
import { join, dirname } from 'path';
import { ConfigFactory } from '@nestjs/config';
import { AxiosProxyConfig } from 'axios';
import { redisStore } from 'cache-manager-ioredis-yet';
import { memo } from 'radash';

interface AppConfig {
    NODE_ENV: string;
    PORT: number;
    // HTTPS_KEY: string;
    // HTTPS_CERT: string;
    DOUYIN: {
        cookie: string;
    };
    REDIS: {
        store: any;
        host?: string;
        port?: number;
        password?: string;
        db?: number;
        ttl: number;
        max?: number;
    };
    DEFAULT_PROXY_CONFIG: AxiosProxyConfig | null;
    PROXY_STRING: string;
}
const ROOT: string = dirname(dirname(dirname(__dirname)));
const isDev = process.env.NODE_ENV === 'development';

const proxyPattern = /^(?:http:\/\/)?(?:([^:]+):([^@]+)@)?([^:\/]+)(?::(\d+))?/;

function _getConfigs(): AppConfig {
    const envProxyConfig: string = process.env.DEFAULT_PROXY || '';
    const match = envProxyConfig ? envProxyConfig.match(proxyPattern) : null;
    let auth: { username: string; password: string } | null = null;
    let host: string | null = null;
    let port: number | null = null;
    let protocol: string | null = null;
    if (match) {
        auth = match[1] ? { username: match[1], password: match[2] } : null;
        host = match[3];
        port = Number(match[4] || '80');
        protocol = match[0].startsWith('https') ? 'https' : 'http';
    }
    const defaultProxy: AxiosProxyConfig = envProxyConfig
        ? {
              host: host,
              port: port,
              protocol: protocol,
              ...auth,
          }
        : null;
    const redisConfig: AppConfig['REDIS'] = isDev
        ? {
              store: 'memory',
              ttl: 5 * 60 * 1000, // 5 minutes
              max: 10,
          }
        : {
              store: redisStore,
              host: process.env.REDIS_HOST || '127.0.0.1',
              port: Number(process.env.REDIS_PORT) || 16379,
              password: process.env.REDIS_PASSWORD || '',
              db: Number(process.env.REDIS_DB) || 1,
              ttl: 5 * 60 * 1000, // 5 minutes
          };
    return {
        NODE_ENV: process.env.NODE_ENV || 'development',
        PORT: Number(process.env.port) || 3000,
        // HTTPS_KEY: join(ROOT, 'src/secret/privkey.pem'),
        // HTTPS_CERT: join(ROOT, 'src/secret/fullchain.pem'),
        DOUYIN: {
            cookie: process.env.DOUYIN_COOKIE || '',
        },
        REDIS: redisConfig,
        DEFAULT_PROXY_CONFIG: defaultProxy,
        PROXY_STRING: envProxyConfig,
    };
}

export const memoizedGetConfig = memo(_getConfigs);

export const configuration: ConfigFactory<AppConfig> = () => {
    return memoizedGetConfig();
};

export const config = memoizedGetConfig();
