import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from 'winston';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    constructor(private readonly logger: Logger) {}
    /**Catch controller exception */
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();
        const res: any = JSON.stringify(exception.getResponse());
        const msg: string = exception.message || res;
        let log: string = `--> Error: [${request.method}] ${request.url} ${status} response: ${res}`;
        if (msg !== res) {
            log += `msg: ${msg}`;
        }
        this.logger.error(log);

        response.status(status).json({
            statusCode: status,
            error: res,
            message: msg,
            path: request.path,
        });
    }
}
