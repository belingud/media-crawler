import { transports, format } from 'winston';
import { utilities as nestWinstonFormat } from 'nest-winston';

export function getNestWinstonOptions(
    appName: string = 'media-crawler',
): object {
    return {
        transports: [
            new transports.Console({
                level:
                    process.env.NODE_ENV === 'development' ? 'debug' : 'info',
                format: format.combine(
                    format.timestamp(),
                    format.ms(),
                    nestWinstonFormat.format.nestLike(appName, {
                        colors: process.env.NODE_ENV === 'development',
                        prettyPrint: true,
                    }),
                ),
            }),
        ],
    };
}

export const nestWinstonOptions = getNestWinstonOptions();
