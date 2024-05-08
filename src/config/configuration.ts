/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Move ssl secret key and cert to src/secret folder
 * 将ssl的key和cert文件移到项目的src/secret目录下
 */
import { join, dirname } from 'path';
import { ConfigFactory } from '@nestjs/config';

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
}
const ROOT: string = dirname(dirname(dirname(__dirname)));

// 从yml中读取配置，作为备选
const YAML_CONFIG_FILENAME = `./config.${process.env.NODE_ENV || 'development'}.yml`;

export const configuration: ConfigFactory<AppConfig> = () => {
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
      port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 16379,
      password: process.env.REDIS_PASSWORD || '',
      db: process.env.REDIS_DB ? Number(process.env.REDIS_DB) : 1,
    },
  } as AppConfig;
};

export const config = configuration();
