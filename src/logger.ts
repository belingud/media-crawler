import { createLogger, Logger } from 'winston';
import { getNestWinstonOptions } from './options/winston.options';
import { WinstonModule } from 'nest-winston';

export function getLogger(appName: string = 'media-crawler'): Logger {
  return createLogger(getNestWinstonOptions(appName));
}

export const logger: Logger = getLogger('main');

export const loggerService = WinstonModule.createLogger({ instance: logger });
