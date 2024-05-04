import { Module } from '@nestjs/common';
// import { DemoModule } from './demo/demo.module';
import { ConfigModule } from '@nestjs/config';
import { ApiModule } from './api/api.module';
import { configuration } from './config/configuration';
import { ThrottlerModule } from '@nestjs/throttler';

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
  ],
})
export class AppModule {}
