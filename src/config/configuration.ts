/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Move ssl secret key and cert to src/secret folder
 * 将ssl的key和cert文件移到项目的src/secret目录下
 */
import { join, dirname } from 'path';
import { ConfigFactory } from '@nestjs/config';
import { AxiosProxyConfig } from 'axios';

interface AppConfig {
    NODE_ENV: string;
    PORT: number;
    HTTPS_KEY: string;
    HTTPS_CERT: string;
    DOUYIN: {
        cookie: string;
    };
    REDIS: {
        host: string;
        port: number;
        password: string;
        db: number;
    };
    DEFAULT_PROXY_CONFIG: AxiosProxyConfig | null;
}
const ROOT: string = dirname(dirname(dirname(__dirname)));

// 从yml中读取配置，作为备选
const YAML_CONFIG_FILENAME = `./config.${process.env.NODE_ENV || 'development'}.yml`;

export const configuration: ConfigFactory<AppConfig> = () => {
    let envProxyConfig: string = process.env.DEFAULT_PROXY || '';
    let defaultProxy: AxiosProxyConfig;
    if (envProxyConfig) {
        // 代理配置格式：<protocol>://<username>:<password>@<host>:<port>或者<protocol>://<host>:<port>
        // 处理代理配置，将url format转成proxy对象
        let _conf: Array<string> = envProxyConfig.split(':');
        defaultProxy = { host: '', port: 0 };
        defaultProxy.protocol = _conf[0];
        defaultProxy.port = Number(_conf.pop());
        if (_conf.length === 2) {
            defaultProxy.host = _conf[1].substring(2);
        } else if (_conf.length === 3) {
            let [pass, host] = _conf.pop().split('@');
            defaultProxy.host = host;
            let username: string = _conf.pop().substring(2);
            defaultProxy.auth = {
                username: username,
                password: pass,
            };
        }
    }
    return {
        NODE_ENV: process.env.NODE_ENV || 'development',
        PORT: process.env.port ? Number(process.env.port) : 3000,
        HTTPS_KEY: join(ROOT, 'src/secret/privkey.pem'),
        HTTPS_CERT: join(ROOT, 'src/secret/fullchain.pem'),
        DOUYIN: {
            cookie: process.env.DOUYIN_COOKIE || '',
        },
        REDIS: {
            host: process.env.REDIS_HOST || '127.0.0.1',
            port: process.env.REDIS_PORT
                ? Number(process.env.REDIS_PORT)
                : 16379,
            password: process.env.REDIS_PASSWORD || '',
            db: process.env.REDIS_DB ? Number(process.env.REDIS_DB) : 1,
        },
        DEFAULT_PROXY_CONFIG: defaultProxy,
    } as AppConfig;
};

export const config = configuration();
