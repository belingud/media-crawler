/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Move ssl secret key and cert to src/secret folder
 * 将ssl的key和cert文件移到项目的src/secret目录下
 */
import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join, dirname } from 'path';
import { ConfigFactory, ConfigService } from '@nestjs/config';

interface AppConfig {
  NODE_ENV: string;
  PORT: number;
  HTTPS_KEY: string;
  HTTPS_CERT: string;
  DOUYIN: {
    cookie: string;
  };
}
const ROOT: string = dirname(dirname(dirname(__dirname)));

// 从yml中读取配置，作为备选
const YAML_CONFIG_FILENAME = `./config.${process.env.NODE_ENV || 'development'}.yml`;

export const configuration: ConfigFactory<Record<string, any>> = () => {
  // const yamlConfig = yaml.load(
  //   readFileSync(join(__dirname, YAML_CONFIG_FILENAME), 'utf8'),
  // ) as Record<string, any>; // Use `any` or a more specific type if possible
  // if (yamlConfig.https_key) {
  //   yamlConfig.https_key = join(ROOT, yamlConfig.https_key);
  // }
  // if (yamlConfig.https_cert) {
  //   yamlConfig.https_cert = join(ROOT, yamlConfig.https_cert);
  // }

  // return yamlConfig as AppConfig;
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
  } as Record<string, any>;
};

export const configInstance = new ConfigService();
