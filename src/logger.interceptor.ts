import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable, tap } from 'rxjs';

/**
 * Logs a message with the given prefix, method, path, status, and elapsed time.
 *
 * @param {CallableFunction} fn - The function to call with the log message.
 * @param {string} prefix - The prefix to prepend to the log message.
 * @param {string} method - The HTTP method of the request.
 * @param {any} path - The path of the request.
 * @param {number} [status=0] - The status code of the response (default: 0).
 * @param {any} [elapsed=undefined] - The elapsed time of the request (default: undefined).
 */
function log(
  fn: CallableFunction,
  prefix: string,
  method: string,
  path: any,
  status: number = 0,
  elapsed: any = undefined,
) {
  const out =
    prefix === '<--' /* Incoming */
      ? `  ${prefix} ${method} ${path}`
      : `  ${prefix} ${method} ${path} ${status} ${elapsed}ms`;
  fn(out);
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  /**
   * Intercepts the incoming request and logs the method and URL.
   *
   * @param {ExecutionContext} context - The execution context of the request.
   * @param {CallHandler} next - The next call handler in the chain.
   * @return {Observable<any>} An observable that represents the result of the intercepted request.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const incoming = context.getArgByIndex(0);
    const method: string = incoming.method;
    const url: string = incoming.url;
    log(console.log, '<--', method, url);

    const start = Date.now();
    return next.handle().pipe(
      tap(() => {
        const res = context.getArgByIndex(1);
        log(
          console.log,
          '-->',
          method,
          url,
          res.statusCode,
          Date.now() - start,
        );
      }),
      catchError((err) => {
        console.log(`--> Error: [${method}] ${url}`, err);
        throw err;
      }),
    );
  }
}
