import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApiModule } from './api/api.module';
import { configuration } from './config/configuration';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';

@Module({
  imports: [
    ApiModule,
    ConfigModule.forRoot({ load: [configuration] }), // 自定义的config loader,读取yml中的配置
    // ConfigModule.forRoot({ envFilePath: '.env' }), // 从.env文件中直接读取，不做处理
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 10, // 10 requests
      },
    ]),
    CacheModule.registerAsync({
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
