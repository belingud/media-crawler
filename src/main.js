"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const platform_express_1 = require("@nestjs/platform-express");
const compression = require("compression");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const config_1 = require("./config");
const logger_interceptor_1 = require("./logger.interceptor");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter());
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe());
    app.useGlobalInterceptors(new logger_interceptor_1.LoggingInterceptor());
    app.use(compression({
        filter: () => {
            return true;
        },
        threshold: -1,
    }));
    await app.listen(config_1.PORT);
}
bootstrap().then(() => console.log(`Application is running on: ${config_1.PORT}`));
//# sourceMappingURL=main.js.map