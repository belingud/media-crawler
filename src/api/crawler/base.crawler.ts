import { firstValueFrom } from 'rxjs';
import { Platform } from '../../pkg/enum';
import { findUrl } from '../../pkg/util';
import { Injectable, NotImplementedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { UserAgent } from '../../api.config';

@Injectable()
export class BaseCrawler {
    constructor(protected readonly http: HttpService) {}
    #headers: object = {
        'User-Agent': UserAgent,
    };
    async convertShareUrl(text: string): Promise<string> {
        let url: string = findUrl(text);
        if (url.includes(Platform.douyin)) {
            /**Get douyin original url, except receive 302 response, get url from header */
            if (url.includes('v.douyin')) {
                url = url.match(/(https:\/\/v.douyin.com\/)\w+/i)[0];
                console.log(
                    `Get orginal url by ${Platform.douyin} share url...`,
                );
                await firstValueFrom(
                    this.http.get(url, {
                        headers: this.#headers,
                        maxRedirects: 0,
                    }),
                ).catch((err) => {
                    if (err.response.status === 302) {
                        url = err.response.headers.location.split('?')[0];
                    }
                    console.log(`Get original url success: ${url}`);
                });
            } else {
                console.log(`No need to convert: ${url}`);
                return url;
            }
        }
        console.log('return url ' + url);
        return url;
    }
}
