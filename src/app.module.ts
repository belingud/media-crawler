import { RedisClientOptions } from 'redis';
import { Module } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApiModule } from './api/api.module';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { configuration } from './config/configuration';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';

@Module({
  imports: [
    ApiModule,
    ConfigModule.forRoot({ load: [configuration] }), // 自定义的config loader,读取yml中的配置
    // ConfigModule.forRoot({ envFilePath: '.env' }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 10, // 10 requests
      },
    ]),
    CacheModule.registerAsync<Promise<RedisClientOptions>>({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: async (configService: ConfigService) => {
        return {
          store: redisStore,
          ttl: 2 * 60 * 60 * 1000, // 2 hours
          isGlobal: true,
          ...configService.get('REDIS'),
        };
      },
    }),
  ],
})
export class AppModule {}
