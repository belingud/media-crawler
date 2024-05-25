import { SetMetadata } from '@nestjs/common';

export const QUERY_CACHE_KEY = 'queryCache';
export const QueryCache = () => SetMetadata(QUERY_CACHE_KEY, true);
