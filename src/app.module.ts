import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';

import { ApiModule } from './api/api.module';
import { configuration } from './config/configuration';
import { throttlerOptions } from './options/throttler.options';
import { cacheOptions } from './options/cache.options';

@Module({
  imports: [
    ApiModule,
    ConfigModule.forRoot({ load: [configuration] }), // 自定义的config loader,读取yml中的配置
    // ConfigModule.forRoot({ envFilePath: '.env' }), // 从.env文件中直接读取，不做处理
    ThrottlerModule.forRoot([throttlerOptions]),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: async (configService: ConfigService) => {
        return {
          isGlobal: true,
          ...cacheOptions,
          ...configService.get('REDIS'),
        };
      },
    }),
  ],
  providers: [Logger],
})
export class AppModule {}
