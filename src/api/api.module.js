"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiModule = void 0;
const common_1 = require("@nestjs/common");
const api_controller_1 = require("./api.controller");
const api_service_1 = require("./api.service");
const axios_1 = require("@nestjs/axios");
const douyin_crawler_1 = require("./crawler/douyin.crawler");
const tiktok_crawler_1 = require("./crawler/tiktok.crawler");
let ApiModule = class ApiModule {
};
exports.ApiModule = ApiModule;
exports.ApiModule = ApiModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule.register({
                timeout: 5000,
                maxRedirects: 5,
            }),
        ],
        controllers: [api_controller_1.ApiController],
        providers: [api_service_1.ApiService, douyin_crawler_1.DouYinCrawler, tiktok_crawler_1.TikTokCrawler],
    })
], ApiModule);
//# sourceMappingURL=api.module.js.map