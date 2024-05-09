import { redisStore } from 'cache-manager-ioredis-yet';

export const cacheOptions = { store: redisStore, ttl: 5 * 60 * 1000 }; // 5 minutes
