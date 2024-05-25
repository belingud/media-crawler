import { CACHE_MANAGER, CacheStore } from '@nestjs/cache-manager';
import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, from, of } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { QUERY_CACHE_KEY } from 'src/decorators/query-cache.decorstor';
import { genMD5Hash } from 'src/pkg/util';

@Injectable()
export class QueryCacheInterceptor implements NestInterceptor {
    constructor(
        private reflector: Reflector,
        @Inject(CACHE_MANAGER) private cacheManager: CacheStore
    ) {}

    /**
     * Intercepts the incoming request and caches the response if the request is a GET request and the response is cacheable.
     *  根据GET请求的参数来缓存响应
     * @param {ExecutionContext} context - The execution context of the request.
     * @param {CallHandler} next - The next call handler in the chain.
     * @return {Observable<any>} An observable that represents the result of the intercepted request.
     */
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const isCached = this.reflector.get<boolean>(
            QUERY_CACHE_KEY,
            context.getHandler()
        );
        if (!isCached || request.method !== 'GET') {
            return next.handle();
        }

        const cacheKey = genMD5Hash(request.url);

        return from(this.cacheManager.get(cacheKey) as Observable<any>).pipe(
            switchMap((cachedResponse) => {
                if (cachedResponse) {
                    return of(cachedResponse);
                }

                return next.handle().pipe(
                    tap((response) => {
                        this.cacheManager.set(cacheKey, response);
                    })
                );
            })
        );
    }
}
