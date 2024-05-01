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
exports.AppMiddleware = void 0;
const core_1 = require("@nestjs/core");
const platform_express_1 = require("@nestjs/platform-express");
const compression = require("compression");
const express_1 = require("express");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const logger_interceptor_1 = require("./logger.interceptor");
async function bootstrap() {
    const expressApp = (0, express_1.default)();
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(expressApp));
    await app.init();
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe());
    app.useGlobalInterceptors(new logger_interceptor_1.LoggingInterceptor());
    app.use(compression({
        filter: () => {
            return true;
        },
        threshold: -1,
    }));
    return app;
}
const createNest = async (express) => {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(express));
    await app.init();
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe());
    app.useGlobalInterceptors(new logger_interceptor_1.LoggingInterceptor());
    app.use(compression());
    return app;
};
let AppMiddleware = class AppMiddleware {
    expressInstance;
    constructor(expressInstance) {
        this.expressInstance = expressInstance;
    }
    use(req, res, next) {
        console.log('In Nest middleware');
        return createNest(this.expressInstance);
    }
};
exports.AppMiddleware = AppMiddleware;
exports.AppMiddleware = AppMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object])
], AppMiddleware);
module.exports = { createNest, AppMiddleware };
//# sourceMappingURL=app.js.map