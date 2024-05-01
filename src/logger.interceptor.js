"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
function log(fn, prefix, method, path, status = 0, elapsed = undefined) {
    const out = prefix === '<--'
        ? `  ${prefix} ${method} ${path}`
        : `  ${prefix} ${method} ${path} ${status} ${elapsed}ms`;
    fn(out);
}
let LoggingInterceptor = class LoggingInterceptor {
    intercept(context, next) {
        const incoming = context.getArgByIndex(0);
        const method = incoming.method;
        const url = incoming.url;
        log(console.log, '<--', method, url);
        const start = Date.now();
        return next.handle().pipe((0, rxjs_1.tap)(() => {
            const res = context.getArgByIndex(1);
            log(console.log, '-->', method, url, res.statusCode, Date.now() - start);
        }));
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = __decorate([
    (0, common_1.Injectable)()
], LoggingInterceptor);
//# sourceMappingURL=logger.interceptor.js.map