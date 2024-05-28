import { redisStore } from 'cache-manager-ioredis-yet';

// NestJS V5 ttl使用的毫秒,https://docs.nestjs.com/techniques/caching#installation
export const cacheOptions = { store: redisStore, ttl: 5 * 60 * 1000 }; // 5 minutes
