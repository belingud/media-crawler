"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCrawler = void 0;
const rxjs_1 = require("rxjs");
const enum_1 = require("../../pkg/enum");
const util_1 = require("../../pkg/util");
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("../../config");
let BaseCrawler = class BaseCrawler {
    http;
    constructor(http) {
        this.http = http;
    }
    #headers = {
        'User-Agent': config_1.UserAgent,
    };
    async convertShareUrl(text) {
        let url = (0, util_1.findUrl)(text);
        if (url.includes(enum_1.Platform.douyin)) {
            if (url.includes('v.douyin')) {
                url = url.match(/(https:\/\/v.douyin.com\/)\w+/i)[0];
                console.log(`Get orginal url by ${enum_1.Platform.douyin} share url...`);
                await (0, rxjs_1.firstValueFrom)(this.http.get(url, {
                    headers: this.#headers,
                    maxRedirects: 0,
                })).catch((err) => {
                    if (err.response.status === 302) {
                        url = err.response.headers.location.split('?')[0];
                    }
                    console.log(`Get original url success: ${url}`);
                });
            }
            else {
                console.log(`No need to convert: ${url}`);
                return url;
            }
        }
        console.log('return url ' + url);
        return url;
    }
};
exports.BaseCrawler = BaseCrawler;
exports.BaseCrawler = BaseCrawler = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], BaseCrawler);
//# sourceMappingURL=base.crawler.js.map