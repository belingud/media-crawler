"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const demo_controller_1 = require("./demo.controller");
const demo_service_1 = require("./demo.service");
describe('AppController', () => {
    let appController;
    beforeEach(async () => {
        const app = await testing_1.Test.createTestingModule({
            controllers: [demo_controller_1.AppController],
            providers: [demo_service_1.AppService],
        }).compile();
        appController = app.get(demo_controller_1.AppController);
    });
    describe('root', () => {
        it('should return "Hello World!"', () => {
            expect(appController.getHello()).toBe('Hello World!');
        });
    });
});
//# sourceMappingURL=demo.controller.spec.js.map