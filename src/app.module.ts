import { Module } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApiModule } from './api/api.module';
import { configuration } from './config/configuration';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ApiModule,
    ConfigModule.forRoot({ load: [configuration] }),
    // DemoModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 10, // 10 requests
      },
    ]),
    CacheModule.register(),
  ],
})
export class AppModule {}
