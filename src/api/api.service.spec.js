"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const api_service_1 = require("./api.service");
const api_controller_1 = require("./api.controller");
const axios_1 = require("@nestjs/axios");
describe('ApiService', () => {
    let service;
    beforeEach(async () => {
        let app;
        const module = await testing_1.Test.createTestingModule({
            imports: [axios_1.HttpModule],
            controllers: [api_controller_1.ApiController],
            providers: [api_service_1.ApiService],
        }).compile();
        app = module.createNestApplication();
        await app.init();
        service = module.get(api_service_1.ApiService);
        console.log(service);
    });
});
//# sourceMappingURL=api.service.spec.js.map