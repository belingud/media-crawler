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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiController = void 0;
const common_1 = require("@nestjs/common");
const api_service_1 = require("./api.service");
let ApiController = class ApiController {
    appService;
    constructor(appService) {
        this.appService = appService;
    }
    async getInfo(request, res, url, minimal = false) {
        if (!url) {
            throw new common_1.BadRequestException('Url is required');
        }
        await this.appService
            .hybridParsing(url)
            .then((data) => {
            if (minimal) {
                data = this.appService.getMinimalData(data);
            }
            res.status(common_1.HttpStatus.OK).json(data);
        })
            .catch((err) => {
            console.log(`Parse url error: ${err}`);
            throw new common_1.InternalServerErrorException('Parse url error');
        });
    }
};
exports.ApiController = ApiController;
__decorate([
    (0, common_1.Get)('/api'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Query)('url')),
    __param(3, (0, common_1.Query)('minimal', common_1.ParseBoolPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, Boolean]),
    __metadata("design:returntype", Promise)
], ApiController.prototype, "getInfo", null);
exports.ApiController = ApiController = __decorate([
    (0, common_1.Controller)('/'),
    __metadata("design:paramtypes", [api_service_1.ApiService])
], ApiController);
//# sourceMappingURL=api.controller.js.map