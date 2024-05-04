import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';
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

const YAML_CONFIG_FILENAME = `./config.${process.env.NODE_ENV || 'development'}.yml`;

export const configuration: ConfigFactory<AppConfig> = () => {
  const yamlConfig = yaml.load(
    readFileSync(join(__dirname, YAML_CONFIG_FILENAME), 'utf8'),
  ) as Record<string, any>; // Use `any` or a more specific type if possible

  return yamlConfig as AppConfig;
};
