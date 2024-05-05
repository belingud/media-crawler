/**
 * Move ssl secret key and cert to src/secret folder
 * 将ssl的key和cert文件移到项目的src/secret目录下
 */
import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join, dirname } from 'path';
import { ConfigFactory } from '@nestjs/config';

interface AppConfig {
  NODE_ENV: string;
  PORT: number;
  HTTPS_KEY: string;
  HTTPS_CERT: string;
  douyin: {
    cookie: string;
  };
}
const ROOT: string = dirname(dirname(dirname(__dirname)));

const YAML_CONFIG_FILENAME = `./config.${process.env.NODE_ENV || 'development'}.yml`;

export const configuration: ConfigFactory<AppConfig> = () => {
  const yamlConfig = yaml.load(
    readFileSync(join(__dirname, YAML_CONFIG_FILENAME), 'utf8'),
  ) as Record<string, any>; // Use `any` or a more specific type if possible
  if (yamlConfig.HTTPS_KEY) {
    yamlConfig.HTTPS_KEY = join(ROOT, yamlConfig.HTTPS_KEY);
  }
  if (yamlConfig.HTTPS_CERT) {
    yamlConfig.HTTPS_CERT = join(ROOT, yamlConfig.HTTPS_CERT);
  }

  return yamlConfig as AppConfig;
};
