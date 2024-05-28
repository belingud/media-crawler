import { TwitterOpenApi } from './twitter-openapi-typescript/src/api';
import { Injectable } from '@nestjs/common';
// import { TwitterOpenApi } from 'twitter-openapi-typescript';

export interface CookieType {
    [key: string]: string;
}

@Injectable()
export class XOpenAPI extends TwitterOpenApi {}
