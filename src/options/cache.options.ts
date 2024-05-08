import { redisStore } from 'cache-manager-ioredis-yet';

export const cacheOptions = { store: redisStore, ttl: 2 * 60 * 60 * 1000 }; // 2 hours
