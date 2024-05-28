import { firstValueFrom } from 'rxjs';
import { Platform } from '../../common/enum';
import { findUrl } from '../../common/util';
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
// https://v16-webapp-prime.tiktok.com/video/tos/useast2a/tos-useast2a-ve-0068c001/a7f5e6f862dc489b85a5ffa7e32a2f35/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=unwatermarked&cd=0%7C0%7C0%7C&cv=1&br=1744&bt=872&cs=0&ds=6&ft=-Csk_mDUPD12NZTT0T-Uxk1FSY6e3wv251cAp&mime_type=video_mp4&qs=5&rc=ZDM4Ozg2OGg1aDtnOTo0NEBpanZtanRkMzo7NjMzNzczM0BiYmExXjMxX2ExYjMvXzYzYSM2ZWE2LjVkX2JgLS1kMTZzcw%3D%3D&btag=e00088000&expire=1716754491&l=20240526141443BEF34C409AB1A1AC571A&ply_type=2&policy=2&signature=4e94996d417d5d8c011f0a761f225b9d&tk=tt_chain_token
// https://v16-webapp-prime.tiktok.com/video/tos/useast2a/tos-useast2a-ve-0068c001/0a29a5b135654f2198260d8a109e2d5d/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=unwatermarked&cd=0%7C0%7C0%7C&cv=1&cs=0&ds=6&mime_type=video_mp4&qs=5&rc=NzhnNTpkNjM5ODQ6M2Y7NkBpanZtanRkMzo7NjMzNzczM0BjMi0zLV4zNmMxLi4xNGJfYSM2ZWE2LjVkX2JgLS1kMTZzcw%3D%3D&btag=e00088000&expire=1716754371&l=20240526141243B4DD2F56F83E19ADD947&ply_type=2&policy=2&signature=a723eb4e970041fd5beaf7962504b67b&tk=tt_chain_token
// https://v16-webapp-prime.tiktok.com/video/tos/useast2a/tos-useast2a-ve-0068c001/0a29a5b135654f2198260d8a109e2d5d/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=unwatermarked&cd=0%7C0%7C0%7C&cv=1&br=4384&bt=2192&cs=0&ds=6&ft=4fUEKMzm8Zmo0j7-q-4jVdy7ypWrKsd.&mime_type=video_mp4&qs=0&rc=NzhnNTpkNjM5ODQ6M2Y7NkBpanZtanRkMzo7NjMzNzczM0BjMi0zLV4zNmMxLi4xNGJfYSM2ZWE2LjVkX2JgLS1kMTZzcw%3D%3D&btag=e00088000&expire=1716754371&l=20240526141243B4DD2F56F83E19ADD947&ply_type=2&policy=2&signature=a723eb4e970041fd5beaf7962504b67b&tk=tt_chain_token