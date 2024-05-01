import { AppService } from './demo.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): string;
}
