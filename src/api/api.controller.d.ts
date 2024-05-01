import { ApiService } from './api.service';
import { Response } from 'express';
export declare class ApiController {
    private readonly appService;
    constructor(appService: ApiService);
    getInfo(request: Request, res: Response, url: string, minimal?: boolean): Promise<void>;
}
